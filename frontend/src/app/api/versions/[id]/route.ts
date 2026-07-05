import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/apiHandlers";

type Context = { params: Promise<{ id: string }> };

export const GET = async (_request: NextRequest, { params }: Context) => {
  const { id } = await params;
  const version = await prisma.version.findUnique({ where: { id } });
  if (!version) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(version);
};

export const PATCH = async (request: NextRequest, { params }: Context) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const version = await prisma.version.update({ where: { id }, data: body });
    return NextResponse.json(version);
  } catch (err) {
    return errorResponse(err);
  }
};

export const DELETE = async (_request: NextRequest, { params }: Context) => {
  try {
    const { id } = await params;
    await prisma.version.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
};
