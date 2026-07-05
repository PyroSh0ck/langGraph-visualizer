import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/apiHandlers";

type Context = { params: Promise<{ id: string }> };

export const GET = async (_request: NextRequest, { params }: Context) => {
  const { id } = await params;
  const run = await prisma.run.findUnique({ where: { id } });
  if (!run) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(run);
};

export const PATCH = async (request: NextRequest, { params }: Context) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const run = await prisma.run.update({ where: { id }, data: body });
    return NextResponse.json(run);
  } catch (err) {
    return errorResponse(err);
  }
};

export const DELETE = async (_request: NextRequest, { params }: Context) => {
  try {
    const { id } = await params;
    await prisma.run.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
};
