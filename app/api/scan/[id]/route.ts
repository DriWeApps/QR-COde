import { NextRequest, NextResponse } from "next/server";
import {
  GetCommand,
  UpdateCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

const QR_TABLE = process.env.QR_TABLE_NAME!;
const SCAN_TABLE = process.env.SCAN_TABLE_NAME!;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find QR
    const result = await db.send(
      new GetCommand({
        TableName: QR_TABLE,
        Key: {
          id,
        },
      })
    );

    if (!result.Item) {
      return NextResponse.json(
        { error: "QR Code not found" },
        { status: 404 }
      );
    }

    // Increase scan count
    await db.send(
      new UpdateCommand({
        TableName: QR_TABLE,
        Key: {
          id,
        },
        UpdateExpression:
          "SET scanCount = if_not_exists(scanCount, :zero) + :inc",
        ExpressionAttributeValues: {
          ":zero": 0,
          ":inc": 1,
        },
      })
    );

    // Save scan history
    await db.send(
      new PutCommand({
        TableName: SCAN_TABLE,
        Item: {
          qrId: id,
          scanId: crypto.randomUUID(),
          scannedAt: new Date().toISOString(),
          ip:
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "Unknown",
          userAgent:
            req.headers.get("user-agent") || "Unknown",
        },
      })
    );

    // Redirect to Thank You page
    return NextResponse.redirect(
  `${process.env.NEXT_PUBLIC_BASE_URL}/scan/${id}`,
  302
);

  } catch (error) {
    console.error("Scan Error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}