import { NextResponse } from "next/server";
import {
    PutCommand,
    GetCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

const TABLE_NAME = process.env.QR_TABLE_NAME;

function isValidUrl(value: string) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

function getFriendlyErrorMessage(error: unknown) {
    if (error instanceof Error) {
        if (error.message.includes("Missing credentials")) {
            return "DynamoDB credentials are not configured. Please add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.";
        }

        return error.message;
    }

    return "Internal server error.";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, cafeName, destination } = body ?? {};

        if (!TABLE_NAME) {
            return NextResponse.json(
                {
                    success: false,
                    message: "QR storage is not configured yet. Please set QR_TABLE_NAME in your environment.",
                },
                { status: 503 }
            );
        }

        if (!id || !cafeName || !destination) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cafe name and destination are required.",
                },
                { status: 400 }
            );
        }

        if (typeof id !== "string" || typeof cafeName !== "string" || typeof destination !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "QR ID, cafe name, and destination must be strings.",
                },
                { status: 400 }
            );
        }

        if (!isValidUrl(destination)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid destination URL. Please provide a valid http or https link.",
                },
                { status: 400 }
            );
        }

        const existingQR = await db.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    id,
                },
            })
        );

        if (existingQR.Item) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A QR Code for this cafe already exists.",
                },
                { status: 409 }
            );
        }

        await db.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id,
                    cafeName,
                    destination,
                    scanCount: 0,
                    createdAt: new Date().toISOString(),
                },
            })
        );

        return NextResponse.json({
            success: true,
            message: "QR Code created successfully.",
        });
    } catch (error) {
        console.error("Create QR Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: getFriendlyErrorMessage(error),
            },
            {
                status: 500,
            }
        );
    }
}