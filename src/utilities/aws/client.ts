import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
    region: process.env.AWS_REGION!,
    maxAttempts: 3,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
})

export { sesClient, SendEmailCommand }


// https://nexus-vyoma.s3.ap-south-2.amazonaws.com/profile/653f90f8-0f21-48d6-8fc5-9c51c9ba9357.jpg