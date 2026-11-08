import { connectToDatabase } from "@/database/db";
import EntryTicket from "@/database/schema/entry-ticket.schema";
import EventTeamMember from "@/database/schema/event-team-member.schema";
import RegisterUser from "@/database/schema/register-user.schema";
import { sendQREmail } from "@/utilities/emails/ticket-qr-mail";
import { generateQRCode } from "@/utilities/generate-qr";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

async function handleSendEmail(request: NextRequest) {
    try {
        let senderEmail: string | null = null;
        if (request.method === "GET") {
            senderEmail = request.nextUrl.searchParams.get("senderEmail");
            if (!senderEmail) {
                const body = await request.json().catch(() => null);
                senderEmail = body?.senderEmail;
            }
        } else {
            const body = await request.json().catch(() => null);
            senderEmail = body?.senderEmail;
        }

        if (!senderEmail || typeof senderEmail !== "string") {
            return NextResponse.json({
                message: "Invalid email provided",
                data: null,
                error: "INVALID_EMAIL",
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
                message: "Cannot send email feature for non-admin users",
                data: null,
                error: "NOT_ADMIN",
                redirect: false,
                redirectUrl: null,
            }, { status: 403 });
        }

        const targetEmail = senderEmail.trim();
        const senderDetails = await RegisterUser.findOne({
            email: { $regex: new RegExp(`^${targetEmail}$`, "i") }
        });

        if (!senderDetails) {
            return NextResponse.json({
                message: "Sender details not found",
                data: null,
                error: "SENDER_NOT_FOUND",
                redirect: false,
                redirectUrl: null,
            }, { status: 404 });
        }

        const entryTicket = await EntryTicket.findOne({ userId: senderDetails._id, isPaid: true });

        if (!entryTicket) {
            return NextResponse.json({
                message: "Sender details do not have a paid ticket(s)",
                data: null,
                error: "SENDER_NOT_FOUND",
                redirect: false,
                redirectUrl: null,
            }, { status: 404 });
        }

        const senderData = { userId: entryTicket?.userId, userEmail: senderDetails?.email };
        const qr_code = await generateQRCode(senderData);

        await sendQREmail(senderDetails?.email, senderDetails?.full_name, qr_code);

        return NextResponse.json({
            message: "Send email feature fetched successfully",
            data: null,
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
    return handleSendEmail(request);
}

export async function GET(request: NextRequest) {
    return handleSendEmail(request);
}
