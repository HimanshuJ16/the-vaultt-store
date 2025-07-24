import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Handles POST requests to upload a file to Cloudinary.
 * Expects 'multipart/form-data' with a 'file' field.
 *
 * @param req The Next.js request object.
 * @returns A JSON response with the secure URL of the uploaded image or an error.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'uploads'; // Get folder from form data

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      // Convert the file to a buffer to be sent to Cloudinary
      const fileBuffer = await file.arrayBuffer();
      const mimeType = file.type;
      const encoding = 'base64';
      const base64Data = Buffer.from(fileBuffer).toString('base64');
      const fileUri = `data:${mimeType};${encoding},${base64Data}`;

      // Upload the image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(fileUri, {
        // Use the folder from the form data
        folder: folder,
      });
      return uploadResponse.secure_url;
    });

    const urls = await Promise.all(uploadPromises);

    // Return the secure URL of the uploaded image
    return NextResponse.json({ urls }, { status: 200 });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to upload image.', details: errorMessage }, { status: 500 });
  }
}