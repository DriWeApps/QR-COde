import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "@/lib/dynamodb";

const TABLE_NAME = process.env.QR_TABLE_NAME!;

export async function GET() {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    return NextResponse.json({
      success: true,
      data: result.Items || [],
    });

  } catch (error) {
    console.error("Stats Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch stats",
      },
      {
        status: 500,
      }
    );
  }
}