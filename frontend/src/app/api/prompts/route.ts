import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, listRecords } from "@/lib/apiHandlers";

export const GET = (request: NextRequest) =>
  listRecords(request, prisma.prompt, "Created_At", ["Name"]);

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const prompt = await prisma.prompt.create({
      data: {
        Name: body.name,
        Description: body.description,
      },
    });
    return NextResponse.json(prompt, { status: 201 });
  } catch (err) {
    console.log(err);
    return errorResponse(err);
  }
};
