import { randomUUID } from "node:crypto";
import { sesClient, SendEmailCommand, } from "./client"

export async function sendEmailWithSES(to: string, subject: string, html: string, text?: string) {
    const from = '"Team Nexus Vyoma" <no-reply@islec.edu.in>';

    try {
        const response = await sesClient.send(
            new SendEmailCommand({
                Source: from,
                Destination: {
                    ToAddresses: [to],
                },
                Message: {
                    Subject: {
                        Data: subject,
                        Charset: "UTF-8",
                    },
                    Body: {
                        Text: {
                            Data: text,
                            Charset: "UTF-8",
                        },
                        Html: {
                            Data: html,
                            Charset: "UTF-8",
                        },
                    },
                },
            }),
        )

        return {
            success: true,
            messageId: response.MessageId,
            error: null,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            messageId: null,
        }
    }
}
