import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetPath = path.join("/");
  const search = req.nextUrl.searchParams.toString();
  const targetUrl = `https://api.jikan.moe/v4/${targetPath}${search ? `?${search}` : ""}`;

  try {
    const res = await fetch(targetUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Jikan error: ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upstream timeout" },
      { status: 504 },
    );
  }
}
