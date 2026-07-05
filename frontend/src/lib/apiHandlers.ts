import { NextResponse, type NextRequest } from "next/server";

type Order = "asc" | "desc";

type Where = Record<string, string>;

interface ListDelegate {
  findUnique(args: { where: { id: string } }): Promise<unknown>;
  findMany(args: {
    where: Where;
    orderBy: Record<string, Order>;
    skip: number;
    take: number;
  }): Promise<unknown[]>;
  count(args: { where: Where }): Promise<number>;
}

export async function listRecords(
  request: NextRequest,
  model: ListDelegate,
  orderColumn: string,
  filterKeys: string[] = [],
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

  const where: Where = {};
  for (const key of filterKeys) {
    const value = params.get(key);
    if (value !== null) where[key] = value;
  }

  const order: Order = params.get("order") === "asc" ? "asc" : "desc";
  const pageAmt = Math.max(1, parseInt(params.get("pageAmt") ?? "", 10) || 20);
  const page = Math.max(1, parseInt(params.get("page") ?? "", 10) || 1);

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy: { [orderColumn]: order },
      skip: (page - 1) * pageAmt,
      take: pageAmt,
    }),
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
