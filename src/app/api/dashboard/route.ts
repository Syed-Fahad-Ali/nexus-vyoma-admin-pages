import { connectToDatabase } from "@/database/db";
import EnrolledIndividualEvent from "@/database/schema/enrolled-individual-event.schema";
import EnrolledTeamEvent from "@/database/schema/enrolled-team-event.schema";
import EventEntry from "@/database/schema/event-entry.schema";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import { currentUser, auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { userId, sessionId } = await auth();
        const eventId = request.headers.get("eventId");

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

        let userData = await EventTeamMember.findOne({
            email: email ? { $regex: new RegExp(`^${email}$`, "i") } : "",
            event_id: eventId,
        });

        if (!userData) {
            return NextResponse.json({
                message: "No user data found",
                data: null,
                error: "No user data found",
                redirect: true,
                redirectUrl: "/",
            }, { status: 403 })
        }

        if (userData.event_id.toString().includes(eventId || "") === false) {
            return NextResponse.json({
                message: "User is not associated with this event",
                data: null,
                error: "User is not associated with this event",
                redirect: false,
                redirectUrl: null,
            }, { status: 403 })
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({
                message: "Event not found",
                data: null,
                error: "Event not found",
                redirect: false,
                redirectUrl: null,
            }, { status: 404 });
        }

        const crewMembers = await EventTeamMember.countDocuments({ event_id: eventId });
        const checkInUsersCount = await EventEntry.countDocuments({ event_id: eventId });

        let enrolledEventCount = 0;

        if (event.participants_type === "individual") {
            enrolledEventCount = await EnrolledIndividualEvent.countDocuments({ event_id: eventId, isPaid: true });
        } else if (event.participants_type === "team") {
            enrolledEventCount = await EnrolledTeamEvent.countDocuments({ event_id: eventId, isPaid: true });
        } else {
            return NextResponse.json({
                message: "Invalid participants_type",
                data: null,
                error: "Invalid participants_type",
                redirect: false,
                redirectUrl: null,
            }, { status: 400 })
        }

        userData.event_id = event;

        return NextResponse.json({
            message: "Events fetched successfully",
            data: {
                userData,
                count: {
                    crewMembersCount: crewMembers,
                    totalEnrolledEventCount: enrolledEventCount,
                    totalCheckInUsersCount: checkInUsersCount,
                },
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