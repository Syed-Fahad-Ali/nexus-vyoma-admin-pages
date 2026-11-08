import mongoose from "mongoose";
import { connectToDatabase } from "@/database/db";
import EnrolledIndividualEvent from "@/database/schema/enrolled-individual-event.schema";
import EnrolledTeamEvent from "@/database/schema/enrolled-team-event.schema";
import EventEntry from "@/database/schema/event-entry.schema";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import RegisterUser from "@/database/schema/register-user.schema";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

async function handleScanUser(request: NextRequest) {
    try {
        let scanUserId: string | null = null;
        let scanUserEmail: string | null = null;

        if (request.method === "GET") {
            scanUserId = request.nextUrl.searchParams.get("userId");
            scanUserEmail = request.nextUrl.searchParams.get("userEmail");
        } else {
            const body = await request.json().catch(() => ({}));
            scanUserId = body.userId;
            scanUserEmail = body.userEmail;
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

        const userDataWithEvents = await EventTeamMember.findOne({
            email: email ? { $regex: new RegExp(`^${email}$`, "i") } : ""
        });

        if (!userDataWithEvents) {
            const clerk = await clerkClient();
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

        const isObjectId = scanUserId && mongoose.isValidObjectId(scanUserId);
        let scanUser = isObjectId ? await RegisterUser.findById(scanUserId) : null;

        if (!scanUser && scanUserEmail) {
            scanUser = await RegisterUser.findOne({
                email: { $regex: new RegExp(`^${scanUserEmail.trim()}$`, "i") }
            });
        }

        if (!scanUser && scanUserId && typeof scanUserId === "string" && scanUserId.includes("@")) {
            scanUser = await RegisterUser.findOne({
                email: { $regex: new RegExp(`^${scanUserId.trim()}$`, "i") }
            });
        }

        if (!scanUser) {
            return NextResponse.json({
                message: "Scanned user not found",
                data: null,
                error: "SCAN_USER_NOT_FOUND",
                redirect: false,
                redirectUrl: null,
            }, { status: 404 });
        }

        const enrolledIndividualEvents = await EnrolledIndividualEvent.find({
            register_user_id: scanUser._id,
            isPaid: true
        }).populate("event_id");

        const enrolledTeamEvents = await EnrolledTeamEvent.find({
            $or: [
                {
                    team_leader_register_user_id: scanUser._id,
                },
                {
                    team_emails: { $in: [scanUser.email] }
                }
            ]
        }).populate("event_id");

        const allEnrolledEvents = [...enrolledIndividualEvents, ...enrolledTeamEvents];

        const checkedInEvents = await EventEntry.find({ attendee: scanUser._id })
            .populate("event_id")
            .populate("attender");

        return NextResponse.json({
            message: "User data fetched successfully",
            data: {
                userDetails: scanUser,
                enrolledEvents: allEnrolledEvents,
                checkedInEvents: checkedInEvents
            },
            error: null,
            redirect: false,
            redirectUrl: null,
        }, { status: 200 });

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

export async function POST(request: NextRequest) {
    return handleScanUser(request);
}

export async function GET(request: NextRequest) {
    return handleScanUser(request);
}
