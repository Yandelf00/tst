
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs"; // ensure Node runtime

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read the file into a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads dir exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Create a filename
    const cleanName = file.name.replace(/[^\w.\-]/g, "_");
    const uniqueName = `${Date.now()}_${cleanName}`;
    const filePath = path.join(uploadsDir, uniqueName);

    // Write file
    await writeFile(filePath, buffer);

    // Public URL to serve this image
    const url = `/uploads/${uniqueName}`;

    return NextResponse.json({ url });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
