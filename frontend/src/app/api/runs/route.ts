import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, listRecords, type FilterSpec } from "@/lib/apiHandlers";

const filterSpecs: FilterSpec[] = [
  { param: "q", type: "contains", relation: "prompt", column: "Name" },
  { param: "createdAfter", type: "date-gte", column: "Executed_At" },
  { param: "createdBefore", type: "date-lte", column: "Executed_At" },
  { param: "Prompt_Id", type: "eq", column: "Prompt_Id" },
  { param: "Version_Id", type: "eq", column: "Version_Id" },
];

const includePrompt = {
  prompt: { select: { id: true, Name: true } },
};

export const GET = (request: NextRequest) =>
  listRecords(request, prisma.run, "Executed_At", filterSpecs, includePrompt);

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const run = await prisma.run.create({ data: body });
    return NextResponse.json(run, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
};
