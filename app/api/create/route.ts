// import { NextResponse } from "next/server";
// import {
//   PutCommand,
//   GetCommand,
// } from "@aws-sdk/lib-dynamodb";

// import { db } from "@/lib/dynamodb";


// const TABLE_NAME = process.env.QR_TABLE_NAME!;


// export async function POST(req: Request) {

//   try {

//     const body = await req.json();

//     const { id, destination } = body;


//     if (!id || !destination) {

//       return NextResponse.json(
//         {
//           success: false,
//           message: "QR ID and destination are required",
//         },
//         {
//           status: 400,
//         }
//       );

//     }



//     // Validate URL

//     try {

//       new URL(destination);

//     } catch {

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid destination URL",
//         },
//         {
//           status: 400,
//         }
//       );

//     }



//     // Check duplicate QR ID

//     const existingQR = await db.send(
//       new GetCommand({
//         TableName: TABLE_NAME,
//         Key: {
//           id,
//         },
//       })
//     );



//     if (existingQR.Item) {

//       return NextResponse.json(
//         {
//           success: false,
//           message: "QR ID already exists",
//         },
//         {
//           status: 409,
//         }
//       );

//     }



//     // Create new QR

//     await db.send(
//       new PutCommand({

//         TableName: TABLE_NAME,

//         Item: {

//           id,

//           destination,

//           scanCount: 0,

//           createdAt: new Date().toISOString(),

//         },

//       })
//     );



//     return NextResponse.json({

//       success: true,

//       message: "QR created successfully",

//     });



//   } catch (error) {


//     console.error(
//       "Create QR Error:",
//       error
//     );


//     return NextResponse.json(

//       {
//         success: false,
//         message: "Server error",
//       },

//       {
//         status: 500,
//       }

//     );

//   }

// }

import { NextResponse } from "next/server";
import {
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "@/lib/dynamodb";

const TABLE_NAME = process.env.QR_TABLE_NAME!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id, cafeName, destination } = body;

    if (!id || !cafeName || !destination) {
      return NextResponse.json(
        {
          success: false,
          message: "Cafe name and destination are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate URL
    try {
      new URL(destination);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination URL.",
        },
        {
          status: 400,
        }
      );
    }

    // Check duplicate Cafe Name
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
        {
          status: 409,
        }
      );
    }

    // Save QR Details
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
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}