import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/database/db";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import Event from "@/database/schema/event.schema";
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

        const email = user?.emailAddresses[0]?.emailAddress?.trim();
        const eventId = request.headers.get("event-id");

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
            email,
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

        if (event.participants_type !== "team") {
            return NextResponse.json({
                message: "Event is not a team event",
                data: null,
                error: "EVENT_NOT_TEAM",
                redirect: true,
                redirectUrl: "/volunteer/dashboard",
            }, { status: 400 });
        }

        const enrolledTeamUsers = await EnrolledTeamEvent.find({
            event_id: eventId,
        });

        if (enrolledTeamUsers.length === 0) {
            return NextResponse.json({
                message: "No enrolled team users found",
                data: null,
                error: "NO_ENROLLED_TEAM_USERS",
                redirect: true,
                redirectUrl: "/volunteer/dashboard",
            }, { status: 404 });
        }

        // Collect all leader IDs and member emails.
        const leaderIds = enrolledTeamUsers.map(
            (enrollment) => enrollment.team_leader_register_user_id
        );

        const memberEmails = enrolledTeamUsers.flatMap(
            (enrollment) => enrollment.team_emails ?? []
        );

        // Fetch all team leaders and members in batches.
        const [teamLeaders, teamMembers] = await Promise.all([
            RegisterUser.find({
                _id: { $in: leaderIds },
            }),
            RegisterUser.find({
                email: { $in: memberEmails },
            }),
        ]);

        // Combine all participant IDs for check-in lookup.
        const participantIds = [
            ...teamLeaders.map((user) => user._id),
            ...teamMembers.map((user) => user._id),
        ];

        const checkedInEntries = await EventEntry.find({
            event_id: eventId,
            attendee: { $in: participantIds },
        });

        const checkedInIds = new Set(
            checkedInEntries.map((entry) => entry.attendee.toString())
        );

        // Create lookup maps for efficient access.
        const teamLeaderMap = new Map(
            teamLeaders.map((user) => [user._id.toString(), user])
        );

        const teamMemberMap = new Map(
            teamMembers.map((user) => [user.email, user])
        );

        // Build final team response.
        const data = enrolledTeamUsers.map((enrollment) => {
            const teamLeaderId = enrollment.team_leader_register_user_id.toString();

            const teamLeader = teamLeaderMap.get(teamLeaderId);

            const teamMembersDetails = (enrollment.team_emails ?? [])
                .map((email: string) => {
                    const teamMember = teamMemberMap.get(email);

                    if (!teamMember) return null;

                    return {
                        teamMember,
                        checkedIn: checkedInIds.has(teamMember._id.toString()),
                    };
                })
                .filter(Boolean);

            return {
                enrolledTeamUser: enrollment,

                teamLeaderDetails: {
                    teamLeader: teamLeader ?? null,
                    checkedIn: teamLeader
                        ? checkedInIds.has(teamLeader._id.toString())
                        : false,
                },

                teamMembersDetails,
            };
        });

        return NextResponse.json({
            message: "Event fetched successfully",
            data: {
                event,
                userData,
                enrolledTeamUsers: data,
            },
            error: null,
            redirect: false,
            redirectUrl: null,
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch team event:", error);

        return NextResponse.json({
            message: "Failed to fetch event",
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
            redirect: false,
            redirectUrl: null,
        }, { status: 500 });
    }
}