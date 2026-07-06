import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, listRecords, type FilterSpec } from "@/lib/apiHandlers";

const filterSpecs: FilterSpec[] = [
  { param: "q", type: "contains", column: "Name" },
  { param: "createdAfter", type: "date-gte", column: "Created_At" },
  { param: "createdBefore", type: "date-lte", column: "Created_At" },
];

export const GET = (request: NextRequest) =>
  listRecords(request, prisma.prompt, "Created_At", filterSpecs);

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
