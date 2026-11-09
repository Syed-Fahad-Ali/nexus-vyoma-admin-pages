import mongoose from "mongoose";
import { connectToDatabase } from "@/database/db";
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

        const volunteerData = await EventTeamMember.find({}).populate("event_id");

        if (!volunteerData || volunteerData.length === 0) {
            return NextResponse.json({
                message: "No volunteer data found",
                data: null,
                error: "NO_VOLUNTEER_DATA",
                redirect: false,
                redirectUrl: null,
            }, { status: 404 });
        }

        const events = await Event.find().select("title _id");

        return NextResponse.json({
            message: "User data fetched successfully",
            data: {
                volunteerData,
                events
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { full_name, volunteerEmail, eventId } = body;
        const { userId, sessionId } = await auth();

        if (!volunteerEmail || !eventId || !full_name) {
            return NextResponse.json(
                {
                    message: "Missing required fields",
                    data: null,
                    error: "Incomplete request body",
                    redirect: false,
                    redirectUrl: null,
                },
                { status: 400 }
            );
        }

        const eventIdArray = eventId.split(",").map((id: string) => id.trim());
        if (eventIdArray.length === 0) {
            return NextResponse.json(
                {
                    message: "Invalid event_id format",
                    data: null,
                    error: "event_id must be a comma-separated string of IDs",
                    redirect: false,
                    redirectUrl: null,
                },
                { status: 400 }
            );
        }

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
        const clerk = await clerkClient();

        const userDataWithEvents = await EventTeamMember.findOne({
            email: email ? { $regex: new RegExp(`^${email}$`, "i") } : ""
        });

        if (!userDataWithEvents) {
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

        const normalizedEmail = volunteerEmail.trim().toLowerCase();

        const volunteerData = await EventTeamMember.findOne({
            email: normalizedEmail,
        });

        if (volunteerData) {
            return NextResponse.json({
                message: "Volunteer with this email already exists",
                data: null,
                error: "VOLUNTEER_EXISTS",
                redirect: false,
                redirectUrl: null,
            }, { status: 409 });
        }

        const newVolunteer = await EventTeamMember.create({
            full_name: full_name.trim(),
            email: normalizedEmail,
            event_id: eventIdArray,
        });

        if (!newVolunteer) {
            return NextResponse.json({
                message: "Failed to create new volunteer",
                data: null,
                error: "FAILED_TO_CREATE_VOLUNTEER",
                redirect: false,
                redirectUrl: null,
            }, { status: 500 });
        }

        let invitation;

        try {
            invitation = await clerk.invitations.createInvitation({
                emailAddress: normalizedEmail,
            });
        } catch (error) {
            await EventTeamMember.findByIdAndDelete(newVolunteer._id);

            if (invitation && invitation.id) {
                await clerk.invitations.deleteInvitation(invitation.id)
            }
            return NextResponse.json({
                message: "Volunteer created, but invitation failed",
                data: {
                    volunteerId: newVolunteer._id,
                },
                error: "CLERK_INVITATION_FAILED",
                redirect: false,
                redirectUrl: null,
            }, { status: 502 });
        }

        return NextResponse.json({
            message: "Volunteer added successfully and invitation sent",
            data: null,
            error: null,
            redirectUrl: null,
            redirect: false,
        }, { status: 201 });

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

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const volunteerId =
            body.volunteerId ||
            request.nextUrl.searchParams.get("volunteerId") ||
            request.nextUrl.searchParams.get("id");

        if (!volunteerId) {
            return NextResponse.json({
                message: "Missing volunteerId parameter",
                data: null,
                error: "Incomplete request body",
                redirect: false,
                redirectUrl: null,
            }, { status: 400 });
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
        const clerk = await clerkClient();

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
        await EventTeamMember;

        const email = user?.emailAddresses[0]?.emailAddress?.trim();

        const userDataWithEvents = await EventTeamMember.findOne({
            email: email ? { $regex: new RegExp(`^${email}$`, "i") } : ""
        });

        if (!userDataWithEvents) {
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

        let deletedVolunteer = null;
        if (mongoose.isValidObjectId(volunteerId)) {
            deletedVolunteer = await EventTeamMember.findByIdAndDelete(volunteerId);
        } else {
            deletedVolunteer = await EventTeamMember.findOneAndDelete({
                email: volunteerId.trim().toLowerCase(),
            });
        }

        if (!deletedVolunteer) {
            return NextResponse.json({
                message: "Volunteer not found",
                data: null,
                error: "VOLUNTEER_NOT_FOUND",
                redirect: false,
                redirectUrl: null,
            }, { status: 404 });
        }

        const invitationList = await clerk.invitations.getInvitationList();

        if (invitationList) {
            const invitationToDelete = invitationList.data.find(invitation => invitation.emailAddress.toLowerCase() === deletedVolunteer.email.toLowerCase());
            if (invitationToDelete) {
                await clerk.invitations.deleteInvitation(invitationToDelete.id);
            }
        }

        return NextResponse.json({
            message: "Volunteer deleted successfully",
            data: null,
            error: null,
            redirect: false,
            redirectUrl: null,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            message: "An error occurred while deleting volunteer",
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
            redirect: true,
            redirectUrl: "/",
        }, { status: 500 });
    }
}

