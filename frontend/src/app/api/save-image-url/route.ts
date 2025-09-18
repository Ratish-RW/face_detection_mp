import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    const filePath = path.join(process.cwd(), "captured_image_url.txt");
    await writeFile(filePath, url, "utf-8");
    return NextResponse.json({ status: "success" });
  } catch (e) {
    return NextResponse.json({ status: "error", error: String(e) }, { status: 500 });
  }
}
