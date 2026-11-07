import { connectToDatabase } from "@/database/db";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // const email = user?.emailAddresses[0]?.emailAddress?.trim();
        const email = "syedaliquadri100@gmail.com"
        const { id: eventId } = await params;

        console.log("Event ID:", eventId);

        const userData = await EventTeamMember.findOne({
            email: email,
            event_id: eventId
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

        const event = await Event.findById(eventId);

        if(!event) {
            return NextResponse.json({
                message: "Event not found",
                data: null,
                error: "EVENT_NOT_FOUND",
                redirect: true,
                redirectUrl: "/events",
            }, { status: 404 })
        }

        return NextResponse.json({
            message: "Events fetched successfully",
            data: {
                event,
                userData
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