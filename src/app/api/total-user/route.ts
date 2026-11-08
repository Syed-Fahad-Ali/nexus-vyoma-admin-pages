import { connectToDatabase } from "@/database/db";
import EntryTicket from "@/database/schema/entry-ticket.schema";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

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

        const email = user?.emailAddresses[0]?.emailAddress?.trim();

        const userData = await EventTeamMember.findOne({
            email: email ? { $regex: new RegExp(`^${email}$`, "i") } : ""
        })

        if (!userData) {
            const clerk = await clerkClient();
            await clerk.sessions.revokeSession(sessionId);

            return NextResponse.json({
                message: "No user data found",
                data: null,
                error: "No user data found",
                redirect: true,
                redirectUrl: "/",
            }, { status: 403 })
        }

        const totalUsersCount = await EntryTicket.countDocuments({ isPaid: true });

        return NextResponse.json({
            message: "Events fetched successfully",
            data: {
                totalUsersCount: totalUsersCount,
            },
            error: null,
            redirect: false,
            redirectUrl: null,
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            message: "Failed to fetch events",
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
            redirect: true,
            redirectUrl: "/",
        }, { status: 500 })
    }
}