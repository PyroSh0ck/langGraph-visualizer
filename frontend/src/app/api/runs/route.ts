import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, listRecords } from "@/lib/apiHandlers";

export const GET = (request: NextRequest) =>
  listRecords(request, prisma.run, "Executed_At", [
    "Prompt_Id",
    "Version_Id",
    "Workflow_Run_Id",
  ]);

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const run = await prisma.run.create({ data: body });
    return NextResponse.json(run, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
};
