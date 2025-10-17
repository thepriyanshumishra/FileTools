import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const outputFormat = formData.get("outputFormat") as string;

    if (!file || !outputFormat) {
      return NextResponse.json(
        { error: "File and output format required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const inputFormat = file.name.split(".").pop()?.toLowerCase();

    // Image conversions
    const imageFormats = ["jpg", "jpeg", "png", "webp", "avif", "gif", "tiff"];
    if (imageFormats.includes(inputFormat || "")) {
      let image = sharp(buffer);

      switch (outputFormat) {
        case "jpg":
        case "jpeg":
          image = image.jpeg({ quality: 90 });
          break;
        case "png":
          image = image.png({ quality: 90 });
          break;
        case "webp":
          image = image.webp({ quality: 90 });
          break;
        case "avif":
          image = image.avif({ quality: 90 });
          break;
        case "gif":
          image = image.gif();
          break;
        case "tiff":
          image = image.tiff();
          break;
        default:
          return NextResponse.json(
            { error: "Unsupported output format" },
            { status: 400 }
          );
      }

      const outputBuffer = await image.toBuffer();
      const outputFilename = file.name.replace(
        /\.[^.]+$/,
        `.${outputFormat}`
      );

      return new NextResponse(outputBuffer, {
        headers: {
          "Content-Type": `image/${outputFormat}`,
          "Content-Disposition": `attachment; filename="${outputFilename}"`,
        },
      });
    }

    return NextResponse.json(
      { error: "Unsupported file format" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: "Conversion failed" },
      { status: 500 }
    );
  }
}
