import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/apiHandlers";

type Context = { params: Promise<{ id: string }> };

export const GET = async (_request: NextRequest, { params }: Context) => {
  const { id } = await params;
  const prompt = await prisma.prompt.findUnique({ where: { id } });
  if (!prompt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(prompt);
};

export const PATCH = async (request: NextRequest, { params }: Context) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const prompt = await prisma.prompt.update({ where: { id }, data: body });
    return NextResponse.json(prompt);
  } catch (err) {
    return errorResponse(err);
  }
};

export const DELETE = async (_request: NextRequest, { params }: Context) => {
  try {
    const { id } = await params;
    await prisma.prompt.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
};
