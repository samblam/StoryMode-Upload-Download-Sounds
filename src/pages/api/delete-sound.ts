import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { soundFile } = await request.json();
    
    if (!soundFile) {
      return new Response(
        JSON.stringify({ error: 'Sound file path is required' }),
        { status: 400 }
      );
    }

    // Get the full file path
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, soundFile.replace(/^\//, ''));

    // Delete the file
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('File deletion error:', error);
      // Continue even if file doesn't exist, to clean up the database
    }

    // Update sounds data file
    const soundsDataPath = path.join(publicDir, 'sounds', 'sounds-data.json');
    let soundsData = [];
    try {
      const data = await fs.readFile(soundsDataPath, 'utf-8');
      soundsData = JSON.parse(data);
      // Filter out the deleted sound
      soundsData = soundsData.filter((sound: any) => sound.file !== soundFile);
      await fs.writeFile(soundsDataPath, JSON.stringify(soundsData, null, 2));
    } catch (error) {
      console.error('Error updating sounds data:', error);
      throw new Error('Failed to update sounds database');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Delete failed' 
      }),
      { status: 500 }
    );
  }
};