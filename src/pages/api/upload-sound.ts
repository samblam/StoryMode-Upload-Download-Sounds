import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('sound') as File;
    const profile = formData.get('profile') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    if (!file || !profile || !name || !description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Please upload MP3, WAV, or OGG files only.' }),
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 5MB limit.' }),
        { status: 400 }
      );
    }

    // Create directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'public');
    const soundsDir = path.join(publicDir, 'sounds', profile);
    await fs.mkdir(soundsDir, { recursive: true });

    // Generate safe filename
    const extension = file.type.split('/')[1];
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${safeName}.${extension}`;
    const filepath = path.join(soundsDir, filename);

    // Save the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filepath, buffer);

    // Update sounds data file
    const soundsDataPath = path.join(publicDir, 'sounds', 'sounds-data.json');
    let soundsData = [];
    try {
      const data = await fs.readFile(soundsDataPath, 'utf-8');
      soundsData = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }

    soundsData.push({
      profile,
      name,
      description,
      file: `/sounds/${profile}/${filename}`
    });

    await fs.writeFile(soundsDataPath, JSON.stringify(soundsData, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true,
        url: `/sounds/${profile}/${filename}`
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }),
      { status: 500 }
    );
  }
};