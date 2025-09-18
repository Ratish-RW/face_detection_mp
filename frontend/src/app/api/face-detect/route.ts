import { NextRequest, NextResponse } from "next/server";

// Dummy in-memory DB for demonstration
const db: Record<string, { name: string; details: string; imageUrl: string }> = {};

export async function POST(req: NextRequest) {
  // Handle both JSON (base64) and multipart (file)
  let image: string | undefined;
  if (req.headers.get("content-type")?.includes("application/json")) {
    const body = await req.json();
    image = body.image;
  } else if (req.headers.get("content-type")?.includes("multipart/form-data")) {
    // For demo, just return a dummy
    image = "uploaded-file";
  }
  if (!image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
  // Simulate face detection and DB insert
  const id = Math.random().toString(36).substring(2, 10);
  db[id] = {
    name: "John Doe",
    details: "Sample person detected from image.",
    imageUrl: image.startsWith("data:") ? image : "/file.svg",
  };
  return NextResponse.json({ id });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !db[id]) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }
  return NextResponse.json(db[id]);
}
