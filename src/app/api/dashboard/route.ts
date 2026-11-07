import { connectToDatabase } from "@/database/db";
import EnrolledIndividualEvent from "@/database/schema/enrolled-individual-event.schema";
import EnrolledTeamEvent from "@/database/schema/enrolled-team-event.schema";
import EventEntry from "@/database/schema/event-entry.schema";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // 1. using auth() to get the current user
        // 2. get eventId from request header
        // 3. Now seach the email and event of current user in the database and gets his coordination events
        /**
            - Now for testing we are using "syedaliquadri100@gmail.com" email
            - Now for testing we are using "64f3e7c1b5e4c8a1d2f3e7c1" eventId
        **/

        await connectToDatabase();

        const email = "syedaliquadri100@gmail.com"
        const eventId = "6ad087ce3f54d0d1e8dfe1e0" // individual eventId for testing
        // const eventId = "6ad1f075829e211806d4cd75" // team eventId for testing

        let userData = await EventTeamMember.findOne({ email });
        if (!userData) {
            // If no user data is found, first delete the user session and then redirect to the login page
            return NextResponse.json({
                message: "No user data found",
                data: null,
                error: "No user data found",
                redirect: true,
                redirectUrl: "/",
            }, { status: 404 })
        }

        if (userData.event_id.toString().includes(eventId) === false) {
            return NextResponse.json({
                message: "User is not associated with this event",
                data: null,
                error: "User is not associated with this event",
                redirect: false,
                redirectUrl: null,
            }, { status: 403 })
        }

        const event = await Event.findById(eventId);

        const crewMembers = await EventTeamMember.countDocuments({ event_id: eventId });
        const checkInUsersCount = await EventEntry.countDocuments({ event_id: eventId });

        let enrolledEventCount;

        if (event.participants_type === "individual") {
            enrolledEventCount = await EnrolledIndividualEvent.countDocuments({ event_id: eventId });
        } else if (event.event_id.participants_type === "team") {
            enrolledEventCount = await EnrolledTeamEvent.countDocuments({ event_id: eventId });
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