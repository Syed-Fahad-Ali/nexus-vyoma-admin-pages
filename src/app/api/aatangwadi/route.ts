import { connectToDatabase } from "@/database/db";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import RegisterUser from "@/database/schema/register-user.schema";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import EntryTicket from "@/database/schema/entry-ticket.schema";

async function handleScanUser(request: NextRequest) {
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

        const entryTickets = await EntryTicket.aggregate([
            {
                $match: {
                    isPaid: true
                }
            },
            {
                $lookup: {
                    from: "enrolledindividualevents",
                    localField: "userId",
                    foreignField: "register_user_id",
                    as: "individualEnrollements"
                }
            },
            {
                $lookup: {
                    from: "enrolledteamevents",
                    localField: "userId",
                    foreignField: "team_leader_register_user_id",
                    as: "teamEnrollements"
                }
            },
            {
                $match: {
                    individualEnrollements: { $size: 0 },
                    teamEnrollements: { $size: 0 }
                }
            }
        ])

        if (!entryTickets || entryTickets.length === 0) {
            return NextResponse.json({
                message: "No user data found",
                data: null,
                error: "No user data found",
                redirect: true,
                redirectUrl: "/",
            }, { status: 403 });
        }

        const asliAatanwadi = await RegisterUser.find({
            _id: { $in: entryTickets.map(ticket => ticket.userId) }
        })

        return NextResponse.json({
            message: "User data fetched successfully",
            data: {
                users: asliAatanwadi
            },
            error: null,
            redirectUrl: null,
            redirect: false,
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

export async function GET(request: NextRequest) {
    return handleScanUser(request);
}
