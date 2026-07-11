import { NextRequest, NextResponse } from "next/server";
import {
    GetCommand,
    UpdateCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

const QR_TABLE = process.env.QR_TABLE_NAME;
const SCAN_TABLE = process.env.SCAN_TABLE_NAME;

function getFriendlyErrorMessage(error: unknown) {
    if (error instanceof Error) {
        if (error.message.includes("Missing credentials")) {
            return "DynamoDB credentials are not configured. Please add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.";
        }

        if (error.message.includes("ValidationException")) {
            return "The DynamoDB table configuration is invalid. Please verify the table names and schema.";
        }

        return error.message;
    }

    return "The scan could not be saved right now.";
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const normalizedId = typeof id === "string" ? id.trim() : "";

        if (!normalizedId) {
            return NextResponse.json(
                { success: false, error: "A valid QR ID is required." },
                { status: 400 }
            );
        }

        if (!QR_TABLE || !SCAN_TABLE) {
            return NextResponse.json(
                {
                    success: false,
                    error: "QR tracking is not configured yet. Please set the DynamoDB table names in the environment.",
                },
                { status: 503 }
            );
        }

        const result = await db.send(
            new GetCommand({
                TableName: QR_TABLE,
                Key: { id: normalizedId },
            })
        );

        if (!result.Item) {
            return NextResponse.json(
                {
                    success: false,
                    error: "We couldn't find that QR code. Please ask the owner to share a valid link.",
                },
                { status: 404 }
            );
        }

        const cafeName =
            typeof result.Item.cafeName === "string"
                ? result.Item.cafeName
                : "this QR code";

        const rawIp =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "Unknown";
        const userAgent = req.headers.get("user-agent") || "Unknown";
        const dedupeWindow = Math.floor(Date.now() / 10000);
        const dedupeKey = `${normalizedId}:${rawIp}:${userAgent}:${dedupeWindow}`;

        const existingScan = await db.send(
            new GetCommand({
                TableName: SCAN_TABLE,
                Key: { scanId: dedupeKey },
            })
        );

        if (!existingScan.Item) {
            await db.send(
                new UpdateCommand({
                    TableName: QR_TABLE,
                    Key: { id: normalizedId },
                    UpdateExpression: "SET scanCount = if_not_exists(scanCount, :zero) + :inc",
                    ExpressionAttributeValues: {
                        ":zero": 0,
                        ":inc": 1,
                    },
                })
            );

            await db.send(
                new PutCommand({
                    TableName: SCAN_TABLE,
                    Item: {
                        qrId: normalizedId,
                        scanId: dedupeKey,
                        scannedAt: new Date().toISOString(),
                        ip: rawIp,
                        userAgent,
                        cafeName,
                    },
                })
            );
        }

        const targetUrl = "https://play.google.com/store/apps/details?id=com.driwe";
        return NextResponse.redirect(targetUrl, 302);
    } catch (error) {
        console.error("Scan Error:", error);
        return NextResponse.json(
            { success: false, error: getFriendlyErrorMessage(error) },
            { status: 500 }
        );
    }
}