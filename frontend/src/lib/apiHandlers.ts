import { NextResponse, type NextRequest } from "next/server";

type Order = "asc" | "desc";

export type FilterSpec =
  | { param: string; type: "eq"; column: string }
  | { param: string; type: "contains"; column: string }
  | { param: string; type: "date-gte" | "date-lte"; column: string }
  | { param: string; type: "contains"; relation: string; column: string };

interface ListDelegate {
  findUnique(args: { where: { id: string } }): Promise<unknown>;
  findMany(args: {
    where: Record<string, unknown>;
    orderBy: Record<string, Order>;
    skip: number;
    take: number;
    include?: Record<string, unknown>;
  }): Promise<unknown[]>;
  count(args: { where: Record<string, unknown> }): Promise<number>;
}

export async function listRecords(
  request: NextRequest,
  model: ListDelegate,
  orderColumn: string,
  specs: FilterSpec[] = [],
  include?: Record<string, unknown>,
) {
  const params = request.nextUrl.searchParams;

  const id = params.get("id");
  if (id) {
    const record = await model.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  }

  const where: Record<string, unknown> = {};

  // Build where object from filter specs
  for (const spec of specs) {
    const value = params.get(spec.param);
    if (value === null) continue;

    if (spec.type === "eq") {
      where[spec.column] = value;
    } else if (spec.type === "contains" && !("relation" in spec)) {
      where[spec.column] = { contains: value, mode: "insensitive" };
    } else if (spec.type === "contains" && "relation" in spec) {
      if (!where[spec.relation]) {
        where[spec.relation] = {};
      }
      const relWhere = where[spec.relation] as Record<string, unknown>;
      relWhere[spec.column] = { contains: value, mode: "insensitive" };
    } else if (spec.type === "date-gte") {
      const existing = where[spec.column] as Record<string, unknown> | undefined;
      where[spec.column] = {
        ...(existing ?? {}),
        gte: new Date(value),
      };
    } else if (spec.type === "date-lte") {
      const existing = where[spec.column] as Record<string, unknown> | undefined;
      where[spec.column] = {
        ...(existing ?? {}),
        lte: new Date(value),
      };
    }
  }

  const order: Order = params.get("order") === "asc" ? "asc" : "desc";
  const pageAmt = Math.max(1, parseInt(params.get("pageAmt") ?? "", 10) || 20);
  const page = Math.max(1, parseInt(params.get("page") ?? "", 10) || 1);

  const findManyArgs: {
    where: Record<string, unknown>;
    orderBy: Record<string, Order>;
    skip: number;
    take: number;
    include?: Record<string, unknown>;
  } = {
    where,
    orderBy: { [orderColumn]: order },
    skip: (page - 1) * pageAmt,
    take: pageAmt,
  };

  if (include) {
    findManyArgs.include = include;
  }

  const [data, total] = await Promise.all([
    model.findMany(findManyArgs),
    model.count({ where }),
  ]);

  return NextResponse.json({
    data,
    page,
    pageAmt,
    total,
    totalPages: Math.ceil(total / pageAmt),
  });
}

function hasCode(err: unknown, code: string): boolean {
  return typeof err === "object" && err !== null && "code" in err &&
    (err as { code?: unknown }).code === code;
}

export function errorResponse(err: unknown) {
  if (hasCode(err, "P2025")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (hasCode(err, "P2002") || hasCode(err, "P2003")) {
    return NextResponse.json({ error: "Invalid request", detail: `${err}` }, { status: 400 });
  }
  if (err instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
