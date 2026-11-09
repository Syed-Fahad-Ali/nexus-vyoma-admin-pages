import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/database/db";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import EnrolledIndividualEvent from "@/database/schema/enrolled-individual-event.schema";
import RegisterUser from "@/database/schema/register-user.schema";
import EventEntry from "@/database/schema/event-entry.schema";
import EnrolledTeamEvent from "@/database/schema/enrolled-team-event.schema";
import EntryTicket from "@/database/schema/entry-ticket.schema";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const scanUserId = body.userId;
        const scanUserEmail = body.userEmail;

        if (!scanUserId || !scanUserEmail) {
            return NextResponse.json({
                message: "Missing userId or userEmail in request body",
                data: null,
                error: "MISSING_FIELDS",
                redirect: false,
                redirectUrl: null,
            }, { status: 400 });
        }

        const { userId, sessionId } = await auth();

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

        const user = await currentUser()

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
        await RegisterUser;

        const email = user?.emailAddresses[0]?.emailAddress?.trim();
        const eventId = request.headers.get("event-id") || request.headers.get("eventId");

        const event = await Event.findById(eventId);

        if (!event) {
            return NextResponse.json({
                message: "Event not found",
                data: null,
                error: "EVENT_NOT_FOUND",
                redirect: true,
                redirectUrl: "/events",
            }, { status: 404 })
        }

        const userData = await EventTeamMember.findOne({
            email: email ? { $regex: new RegExp(`^${email}$`, "i") } : "",
            event_id: event._id,
        });

        if (!userData) {
            const clerk = await clerkClient();
            await clerk.sessions.revokeSession(sessionId);

            return NextResponse.json({
                message: "Forbidden: User don't have permission to scan users for this event",
                data: null,
                error: "FORBIDDEN",
                redirect: true,
                redirectUrl: "/",
            }, { status: 403 })
        }

        const eventEntry = await EventEntry.findOne({
            attendee: scanUserId,
            event_id: event._id,
        });

        if (eventEntry) {
            return NextResponse.json({
                message: "Scanned user has already checked in",
                data: null,
                error: "SCANNED_USER_ALREADY_CHECKED_IN",
                redirect: false,
                redirectUrl: null,
            }, { status: 400 })
        }

        const scanUser = await RegisterUser.findById(scanUserId);

        if (!scanUser) {
            return NextResponse.json({
                message: "Scanned user not found",
                data: null,
                error: "SCANNED_USER_NOT_FOUND",
                redirect: true,
                redirectUrl: "/",
            }, { status: 404 })
        }

        if (scanUser.email.toLowerCase() !== scanUserEmail.toLowerCase()) {
            return NextResponse.json({
                message: "Scanned user email does not match",
                data: null,
                error: "SCANNED_USER_EMAIL_MISMATCH",
                redirect: false,
                redirectUrl: null,
            }, { status: 400 })
        }

        if (scanUser && scanUser.isBanned) {
            return NextResponse.json({
                message: "Scanned user is banned",
                data: null,
                error: "SCANNED_USER_BANNED",
                redirect: false,
                redirectUrl: null,
            }, { status: 403 })
        }

        if (event.participants_type === "individual") {
            const enrolledEvent = await EnrolledIndividualEvent.findOne({
                register_user_id: scanUser._id,
                event_id: event._id,
                isPaid: true
            });

            if (!enrolledEvent) {
                return NextResponse.json({
                    message: "Scanned user is not enrolled in this event",
                    data: null,
                    error: "SCANNED_USER_NOT_ENROLLED",
                    redirect: false,
                    redirectUrl: null,
                }, { status: 404 })
            }

            const newEventEntry = await EventEntry.create({
                attender: userData._id,
                attendee: scanUser._id,
                event_id: event._id,
                enrolled_individual_event_id: enrolledEvent._id,
                checked_in_at: new Date()
            });

            if (!newEventEntry) {
                return NextResponse.json({
                    message: "Failed to create entry ticket",
                    data: null,
                    error: "ENTRY_TICKET_CREATION_FAILED",
                    redirect: false,
                    redirectUrl: null,
                }, { status: 500 })
            }

        } else if (event.participants_type === "team") {
            const enrolledEvent = await EnrolledTeamEvent.findOne({
                $or: [
                    { team_leader_register_user_id: scanUser._id },
                    { team_emails: scanUser.email.toLowerCase() }
                ],
                event_id: event._id,
                isPaid: true
            });

            if (!enrolledEvent) {
                return NextResponse.json({
                    message: "Scanned user is not enrolled in this event",
                    data: null,
                    error: "SCANNED_USER_NOT_ENROLLED",
                    redirect: false,
                    redirectUrl: null,
                }, { status: 404 })
            }

            const newEventEntry = await EventEntry.create({
                attender: userData._id,
                attendee: scanUser._id,
                event_id: event._id,
                enrolled_team_event_id: enrolledEvent._id,
                checked_in_at: new Date()
            });

            if (!newEventEntry) {
                return NextResponse.json({
                    message: "Failed to create entry ticket",
                    data: null,
                    error: "ENTRY_TICKET_CREATION_FAILED",
                    redirect: false,
                    redirectUrl: null,
                }, { status: 500 })
            }

        } else {
            return NextResponse.json({
                message: "Invalid event participants type",
                data: null,
                error: "INVALID_PARTICIPANTS_TYPE",
                redirect: false,
                redirectUrl: null,
            }, { status: 400 })
        }

        return NextResponse.json({
            message: "Scanned user checked in successfully",
            data: {
                name: scanUser.full_name || scanUser.name,
                full_name: scanUser.full_name,
                email: scanUser.email,
                userId: scanUser._id,
            },
            error: null,
            redirect: false,
            redirectUrl: null,
        }, { status: 201 })

    } catch (error) {
        return NextResponse.json({
            message: "Internal server error",
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
            redirect: true,
            redirectUrl: "/",
        }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const { userId, sessionId } = await auth();

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

        const user = await currentUser()

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
        await RegisterUser;
        await EventTeamMember;
        await EventEntry;
        await Event;

        const email = user?.emailAddresses[0]?.emailAddress?.trim();
        const eventId = request.headers.get("event-id") || request.headers.get("eventId");

        if (!eventId) {
            return NextResponse.json({
                message: "Event ID is required",
                data: null,
                error: "EVENT_ID_REQUIRED",
                redirect: false,
                redirectUrl: null,
            }, { status: 400 });
        }

        const userData = await EventTeamMember.findOne({
            email: email ? { $regex: new RegExp(`^${email}$`, "i") } : "",
            event_id: eventId,
        });

        if (!userData) {
            const clerk = await clerkClient();
            await clerk.sessions.revokeSession(sessionId);

            return NextResponse.json({
                message: "No user data found",
                data: null,
                error: "NO_USER_DATA_FOUND",
                redirect: true,
                redirectUrl: "/",
            }, { status: 403 });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return NextResponse.json({
                message: "Event not found",
                data: null,
                error: "EVENT_NOT_FOUND",
                redirect: true,
                redirectUrl: "/events",
            }, { status: 404 });
        }

        const data = await EventEntry.find({ event_id: eventId }).populate("attendee").populate("attender")

        const volunteer = await EventTeamMember.find({ event_id: eventId })

        return NextResponse.json({
            message: "Event fetched successfully",
            data: {
                checkedInUsers: data,
                noOfCheckedInUsers: data.length,
                volunteer,
            },
            error: null,
            redirect: false,
            redirectUrl: null,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            message: "Internal server error",
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
            redirect: false,
            redirectUrl: null,
        }, { status: 500 });
    }
}