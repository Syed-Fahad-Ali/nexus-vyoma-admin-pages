import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/database/db";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
import EnrolledIndividualEvent from "@/database/schema/enrolled-individual-event.schema";
import RegisterUser from "@/database/schema/register-user.schema";
import EventEntry from "@/database/schema/event-entry.schema";
import EnrolledTeamEvent from "@/database/schema/enrolled-team-event.schema";

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

        // const email = user?.emailAddresses[0]?.emailAddress?.trim();
        const email = "syedaliquadri100@gmail.com"
        const eventId = request.headers.get("event-id");

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

        if (!event) {
            return NextResponse.json({
                message: "Event not found",
                data: null,
                error: "EVENT_NOT_FOUND",
                redirect: true,
                redirectUrl: "/events",
            }, { status: 404 })
        }

        let enrolledUsers: any[] = [];
        let individualUsers: any = {};
        let teamUsers: any = {};

        if (event.participants_type === "individual") {
            enrolledUsers = await EnrolledIndividualEvent.find({ event_id: eventId, isPaid: true });

            if (enrolledUsers.length === 0) {
                individualUsers = {
                    count: 0,
                    users: []
                }
            }
            const users = await RegisterUser.find({ _id: { $in: enrolledUsers.map(user => user.register_user_id) } });

            individualUsers = {
                count: enrolledUsers.length,
                users
            }
        } else if (event.participants_type === "team") {
            enrolledUsers = await EnrolledTeamEvent.find({ event_id: eventId, isPaid: true })

            if (enrolledUsers.length === 0) {
                teamUsers = {
                    teamCount: 0,
                    usersCount: 0,
                    users: []
                }
            }

            const teamLeaders = await RegisterUser.find({ _id: { $in: enrolledUsers.map(user => user.team_leader_register_user_id) } });
            const teamMembersByEmail = await RegisterUser.find({
                email: {
                    $in: enrolledUsers.flatMap((enrolledUser) => enrolledUser.team_emails),
                },
            });
            const users = [...teamLeaders, ...teamMembersByEmail]

            teamUsers = {
                count: enrolledUsers.length,
                users,
                usersCount: users.length
            }
        } else {
            return NextResponse.json({
                message: "Invalid participants type",
                data: null,
                error: "INVALID_PARTICIPANTS_TYPE",
                redirect: true,
                redirectUrl: "/events",
            }, { status: 400 })
        }

        const checkedInUsers = await EventEntry.find({ event_id: eventId }).populate("attendee");

        return NextResponse.json({
            message: "Event fetched successfully",
            data: {
                event,
                userData,
                individualUsers,
                teamUsers,
                checkedInUsers: {
                    count: checkedInUsers.length,
                    users: checkedInUsers
                }
            },
            error: null,
            redirect: false,
            redirectUrl: null,
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            message: "Failed to fetch event",
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
            redirect: true,
            redirectUrl: "/",
        }, { status: 500 })
    }
}