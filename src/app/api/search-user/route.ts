import mongoose from "mongoose";
import { connectToDatabase } from "@/database/db";
import EnrolledIndividualEvent from "@/database/schema/enrolled-individual-event.schema";
import EnrolledTeamEvent from "@/database/schema/enrolled-team-event.schema";
import EventEntry from "@/database/schema/event-entry.schema";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import RegisterUser from "@/database/schema/register-user.schema";
import EntryTicket from "@/database/schema/entry-ticket.schema";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

function validateEmail(email: string): boolean {
    return email.includes("@") && email.includes(".");
}

async function handleSearchUser(request: NextRequest) {
    try {
        let searchEmail: string | null = null;

        if (request.method === "GET") {
            searchEmail = request.nextUrl.searchParams.get("email") || request.nextUrl.searchParams.get("userEmail");
        } else {
            const body = await request.json().catch(() => ({}));
            searchEmail = body.email || body.userEmail;
        }

        if (!searchEmail || typeof searchEmail !== "string" || !searchEmail.trim()) {
            return NextResponse.json(
                {
                    message: "Email address is required to search for an attendee",
                    data: null,
                    error: "MISSING_EMAIL",
                    redirect: false,
                    redirectUrl: null,
                },
                { status: 400 }
            );
        }

        const trimmedEmail = searchEmail.trim().toLowerCase();

        if (!validateEmail(trimmedEmail)) {
            return NextResponse.json(
                {
                    message: "Please provide a valid email address (e.g. attendee@example.com)",
                    data: null,
                    error: "INVALID_EMAIL",
                    redirect: false,
                    redirectUrl: null,
                },
                { status: 400 }
            );
        }

        const { userId, sessionId } = await auth();

        if (!userId || !sessionId) {
            return NextResponse.json(
                {
                    message: "Unauthorized access",
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
                    message: "User account not found",
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
        await EntryTicket;
        await RegisterUser;

        const adminEmail = user?.emailAddresses[0]?.emailAddress?.trim();

        const userDataWithEvents = await EventTeamMember.findOne({
            email: adminEmail ? { $regex: new RegExp(`^${adminEmail}$`, "i") } : ""
        });

        if (!userDataWithEvents) {
            const clerk = await clerkClient();
            await clerk.sessions.revokeSession(sessionId);

            return NextResponse.json({
                message: "No user data found in event team records",
                data: null,
                error: "NO_USER_DATA",
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

        const isUserAdmin = Boolean(adminEmail && Array.isArray(adminEmailsList) && adminEmailsList.includes(adminEmail));

        if (!isUserAdmin) {
            return NextResponse.json({
                message: "This tool is restricted to administrators only",
                data: null,
                error: "NOT_ADMIN",
                redirect: false,
                redirectUrl: null,
            }, { status: 403 });
        }

        // Look up target attendee in RegisterUser
        const attendee = await RegisterUser.findOne({
            email: { $regex: new RegExp(`^${trimmedEmail}$`, "i") }
        });

        if (!attendee) {
            return NextResponse.json({
                message: `No attendee found with email: ${trimmedEmail}`,
                data: null,
                error: "ATTENDEE_NOT_FOUND",
                redirect: false,
                redirectUrl: null,
            }, { status: 404 });
        }

        // Look up EntryTicket to check isPaid
        const entryTicket = await EntryTicket.findOne({ userId: attendee._id });
        const isPaid = Boolean(entryTicket?.isPaid === true);
        const isBanned = Boolean(entryTicket?.isBanned || attendee.isBanned);

        // Fetch enrolled individual events
        const enrolledIndividualEvents = await EnrolledIndividualEvent.find({
            register_user_id: attendee._id,
            isPaid: true
        }).populate("event_id");

        // Fetch enrolled team events
        const enrolledTeamEvents = await EnrolledTeamEvent.find({
            $or: [
                {
                    team_leader_register_user_id: attendee._id,
                },
                {
                    team_emails: { $in: [attendee.email] }
                }
            ]
        }).populate("event_id");

        const allEnrolledEvents = [...enrolledIndividualEvents, ...enrolledTeamEvents];

        // Fetch checked-in events
        const checkedInEvents = await EventEntry.find({ attendee: attendee._id })
            .populate("event_id")
            .populate("attender");

        return NextResponse.json({
            message: "Attendee details retrieved successfully",
            data: {
                userDetails: {
                    ...attendee.toObject(),
                    isBanned,
                    isPaid,
                },
                isPaid,
                entryTicket,
                enrolledEvents: allEnrolledEvents,
                checkedInEvents: checkedInEvents,
            },
            error: null,
            redirect: false,
            redirectUrl: null,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            message: "An unexpected error occurred while searching for attendee",
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
            redirect: false,
            redirectUrl: null,
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    return handleSearchUser(request);
}

export async function GET(request: NextRequest) {
    return handleSearchUser(request);
}

