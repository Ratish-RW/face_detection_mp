
import { NextRequest, NextResponse } from "next/server";


// Flask endpoints
const FLASK_IMAGE_URL = "http://localhost:5000/get-image";
const FLASK_RESULT_URL = "http://localhost:5000/get-person"; // (Assume you add this for GET by id)

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  let flaskRes;
  if (contentType.includes("application/json")) {
    // Forward JSON (base64 image) to Flask /get-image
    const body = await req.json();
    flaskRes = await fetch(FLASK_IMAGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } else if (contentType.includes("multipart/form-data")) {
    // Convert file to base64 and send as JSON to Flask /get-image
    const formData = await req.formData();
    const file = formData.get("file");
    if (file && file instanceof Blob) {
      const arrayBuffer = await file.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString("base64");
      const mime = file.type || "image/png";
      const dataUrl = `data:${mime};base64,${base64String}`;
      flaskRes = await fetch(FLASK_IMAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
    } else {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  }

  if (!flaskRes.ok) {
    const error = await flaskRes.text();
    return NextResponse.json({ error }, { status: flaskRes.status });
  }
  const flaskData = await flaskRes.json();
  // Expecting flaskData.result to have { id, ... }
  if (flaskData.status !== "success" || !flaskData.result) {
    return NextResponse.json({ error: flaskData.error || "Face not found" }, { status: 404 });
  }
  // For compatibility, return { id } (add more fields if needed)
  return NextResponse.json({ id: flaskData.result.id, ...flaskData.result });
}

// Optionally, you can proxy GET requests to Flask as well if needed
// Optionally, you can implement GET to fetch person details by id if Flask supports it
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "No id provided" }, { status: 400 });
  }
  // If Flask supports GET by id, forward the request
  // Otherwise, return not implemented
  return NextResponse.json({ error: "GET by id not implemented in Flask backend" }, { status: 501 });
}
