import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, listRecords, type FilterSpec } from "@/lib/apiHandlers";

const filterSpecs: FilterSpec[] = [
  { param: "Prompt_Id", type: "eq", column: "Prompt_Id" },
];

export const GET = (request: NextRequest) =>
  listRecords(request, prisma.version, "Created_At", filterSpecs);

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Determine Version_Messages: prefer new messages array format, fallback to legacy message string
    const versionMessages =
      body.messages && Array.isArray(body.messages)
        ? body.messages
        : body.message
          ? [{ role: "human", content: body.message }]
          : [];

    const version = await prisma.version.create({
      data: {
        Name: body.name,
        Default_Temperature: body.def_temperature || 0,
        Default_Top_P: body.default_top_p || 0,
        Default_Max_Tokens: body.default_max_tokens || 0,
        Version_Messages: versionMessages,
        Bound_Tools: body.bound_tools ?? [],
        Response_Schema: body.response_schema ?? {},
        Context_Schema: body.context_schema ?? {},
        Preferred_Model: body.preferred_model ?? null,
        Description: body.description,
        Prompt_Id: body.prompt_id,
      } as Parameters<typeof prisma.version.create>[0]["data"],
    });
    return NextResponse.json(version, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
};
