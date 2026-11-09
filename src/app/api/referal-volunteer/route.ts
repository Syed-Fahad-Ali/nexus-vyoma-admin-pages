import mongoose from "mongoose";
import { connectToDatabase } from "@/database/db";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import RegisterUser from "@/database/schema/register-user.schema";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import EntryTicket from "@/database/schema/entry-ticket.schema";
import EnrolledIndividualEvent from "@/database/schema/enrolled-individual-event.schema";
import ReferralVolunteer from "@/database/schema/referal-volunteer.schema";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { volunteerEmail, first_email, second_email, third_email } = body;
        const { userId, sessionId } = await auth();

        if (!volunteerEmail || !first_email || !second_email || !third_email) {
            return NextResponse.json(
                {
                    message: "Missing required fields",
                    data: null,
                    error: "Incomplete request body",
                    redirect: false,
                    redirectUrl: null,
                },
                { status: 400 }
            );
        }

        if (!userId || !sessionId) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                    data: null,
                    error: "UNAUTHORIZED",
                    redirect: true,
                    redirectUrl: "/",
                },
                { status: 401 }
            );
        }

        const user = await currentUser();

        if (!user) {
            return NextResponse.json(
                {
                    message: "User not found",
                    data: null,
                    error: "USER_NOT_FOUND",
                    redirect: true,
                    redirectUrl: "/",
                },
                { status: 401 }
            );
        }

        await connectToDatabase();
        await Event;
        await EventTeamMember;

        const email = user?.emailAddresses[0]?.emailAddress?.trim();
        const clerk = await clerkClient();

        const userDataWithEvents = await EventTeamMember.findOne({
            email: email ? { $regex: new RegExp(`^${email}$`, "i") } : ""
        });

        if (!userDataWithEvents) {
            await clerk.sessions.revokeSession(sessionId);

            return NextResponse.json({
                message: "No user data found",
                data: null,
                error: "No user data found",
                redirect: true,
                redirectUrl: "/",
            }, { status: 403 });
        }

        const rawAdminEmails = process.env.ADMIN_EMAILS;
        let adminEmailsList: string[] = [];
        try {
            adminEmailsList = typeof rawAdminEmails === "string" ? JSON.parse(rawAdminEmails) : (rawAdminEmails || []);
        } catch {
            adminEmailsList = rawAdminEmails ? rawAdminEmails.split(",").map((e) => e.trim().replace(/^["']|["']$/g, "")) : [];
        }

        const isUserAdmin = Boolean(email && Array.isArray(adminEmailsList) && adminEmailsList.includes(email));

        if (!isUserAdmin) {
            return NextResponse.json({
                message: "User is not an admin",
                data: null,
                error: "NOT_ADMIN",
                redirect: false,
                redirectUrl: null,
            }, { status: 403 });
        }

        // Check if the volunteer or any of the referral emails already exist in the database
        const existingReferrals = await ReferralVolunteer.find({
            $or: [
                { volunteerEmail: volunteerEmail },
                { referralEmails: { $in: [first_email, second_email, third_email] } }
            ]
        })

        if (existingReferrals.length > 0) {
            return NextResponse.json({
                message: "One or more of the provided emails already exist in the referral records",
                data: null,
                error: "EMAIL_ALREADY_EXISTS",
                redirect: false,
                redirectUrl: null,
            }, { status: 400 });
        }

        const referralAwardEventIds = JSON.parse(
            process.env.REFERAL_AWARD_EVENT_ID || "[]"
        ); // Array of event IDs for which referral awards are applicable. Eg: ["eventId1", "eventId2"]

        if (
            !Array.isArray(referralAwardEventIds) ||
            referralAwardEventIds.length === 0
        ) {
            return NextResponse.json({
                message: "Invalid referral award event configuration",
                data: null,
                error: "INVALID_EVENT_CONFIGURATION",
            }, { status: 500 });
        }

        const volunteerUserData = await RegisterUser.findOne({
            email: volunteerEmail
        })

        if (!volunteerUserData) {
            return NextResponse.json({
                message: "Volunteer user not found",
                data: null,
                error: "VOLUNTEER_USER_NOT_FOUND",
                redirect: false,
                redirectUrl: null,
            }, { status: 404 });
        }

        const volunteerEntryTicket = await EntryTicket.findOne({
            isPaid: true,
            userId: volunteerUserData._id,
        })

        if (!volunteerEntryTicket) {
            return NextResponse.json({
                message: "Volunteer user does not have a paid entry ticket",
                data: null,
                error: "VOLUNTEER_ENTRY_TICKET_NOT_FOUND",
                redirect: false,
                redirectUrl: null,
            }, { status: 404 });
        }

        const referralEmails = [first_email, second_email, third_email];
        for (const email of referralEmails) {
            const existingReferral = await RegisterUser.findOne({
                email: email
            });

            if (!existingReferral) {
                return NextResponse.json({
                    message: `Referral user with email ${email} not found`,
                    data: null,
                    error: "REFERRAL_USER_NOT_FOUND",
                    redirect: false,
                    redirectUrl: null,
                }, { status: 404 });
            }

            const referralEntryTicket = await EntryTicket.findOne({
                isPaid: true,
                userId: existingReferral._id,
            });

            if (!referralEntryTicket) {
                return NextResponse.json({
                    message: `Referral user with email ${email} does not have a paid entry ticket`,
                    data: null,
                    error: "REFERRAL_ENTRY_TICKET_NOT_FOUND",
                    redirect: false,
                    redirectUrl: null,
                }, { status: 404 });
            }
        }

        for (const eventId of referralAwardEventIds) {
            const event = await Event.findById(eventId);

            if (!event) {
                return NextResponse.json({
                    message: `Event with ID ${eventId} not found`,
                    data: null,
                    error: "EVENT_NOT_FOUND",
                    redirect: false,
                    redirectUrl: null,
                }, { status: 404 });
            }

            if (event.participants_type === "individual") {
                const checkEnrolledEvents = await EnrolledIndividualEvent.findOne({
                    register_user_id: volunteerUserData._id,
                    event_id: event._id,
                    isPaid: true
                });

                if (!checkEnrolledEvents) {
                    await EnrolledIndividualEvent.create({
                        register_user_id: volunteerUserData._id,
                        event_id: event._id,
                        transaction_id: volunteerEntryTicket._id,
                        isPaid: true,
                        reservation_time: new Date(),
                        isExtended: false
                    });
                }
            } else if (event.participants_type === "team") {
                return NextResponse.json({
                    message: `Event with ID ${eventId} has a participants_type of "team". This route only supports "individual" participants_type.`,
                    data: null,
                    error: "INVALID_PARTICIPANTS_TYPE",
                    redirect: false,
                    redirectUrl: null,
                }, { status: 400 });
            } else {
                return NextResponse.json({
                    message: `Event with ID ${eventId} has an invalid participants_type`,
                    data: null,
                    error: "INVALID_PARTICIPANTS_TYPE",
                    redirect: false,
                    redirectUrl: null,
                }, { status: 400 });
            }
        }

        const newReferralVolunteer = await ReferralVolunteer.create({
            volunteerEmail: volunteerEmail,
            referralEmails: referralEmails,
            eventsIds: referralAwardEventIds
        });

        if (!newReferralVolunteer) {
            return NextResponse.json({
                message: "Failed to create referral volunteer record",
                data: null,
                error: "FAILED_TO_CREATE_RECORD",
                redirect: false,
                redirectUrl: null,
            }, { status: 500 });
        }

        return NextResponse.json({
            message: "Referral awards processed successfully",
            data: null,
            error: null,
            redirectUrl: null,
            redirect: false,
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({
            message: "An error occurred while processing the request",
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
            redirect: true,
            redirectUrl: "/",
        }, { status: 500 });
    }
}