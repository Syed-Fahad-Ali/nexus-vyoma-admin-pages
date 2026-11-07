import { connectToDatabase } from "@/database/db";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // 1. using auth() to get the current user
        // 2. Now seach the email of current user in the database and gets his coordination events
        /**
            - Now for testing we are using "syedaliquadri100@gmail.com" email
        **/

        await connectToDatabase();
        await Event;

        const email = "syedaliquadri100@gmail.com"

        const userDataWithEvents = await EventTeamMember.findOne({ email }).populate("event_id")

        if (!userDataWithEvents) {
            // If no user data is found, first delete the user session and then redirect to the login page
            return NextResponse.json({
                message: "No user data found",
                data: null,
                error: "No user data found",
                redirect: true,
                redirectUrl: "/",
            }, { status: 404 })
        }

        return NextResponse.json({
            message: "Events fetched successfully",
            data: userDataWithEvents,
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