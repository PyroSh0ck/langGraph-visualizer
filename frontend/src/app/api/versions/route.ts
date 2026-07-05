import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, listRecords } from "@/lib/apiHandlers";

export const GET = (request: NextRequest) =>
  listRecords(request, prisma.version, "Created_At", ["Prompt_Id"]);

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const version = await prisma.version.create({
      data: {
        Name: body.name,
        Default_Temperature: body.def_temperature || 0,
        Default_Top_P: body.default_top_p || 0,
        Default_Max_Tokens: body.default_max_tokens || 0,
        Version_Messages: JSON.stringify({ message: body.message }),
        Bound_Tools: [],
        Response_Schema: JSON.stringify({}),
        Context_Schema: JSON.stringify({}),
        Description: body.description,
        Prompt_Id: body.prompt_id,
      },
    });
    return NextResponse.json(version, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
};
