/**
 * HTTP server for video rendering
 * Provides a REST API for the backend to request video generation
 */

import { spawn } from 'child_process';
import { writeFile, unlink, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const PORT = process.env.PORT || 3001;
const OUTPUT_DIR = '/app/out';

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  await mkdir(OUTPUT_DIR, { recursive: true });
}

interface RenderRequest {
  lines: string[];
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImageUrl?: string;
}

async function renderVideo(props: RenderRequest): Promise<Buffer> {
  const outputFileName = `video-${Date.now()}`;
  const outputPath = join(OUTPUT_DIR, `${outputFileName}.mp4`);
  const propsPath = join(OUTPUT_DIR, `${outputFileName}-props.json`);

  try {
    // Write props to temp file
    await writeFile(propsPath, JSON.stringify(props));

    // Run Remotion render
    const renderProcess = spawn(
      'bunx',
      ['remotion', 'render', 'ContentVideo', outputPath, '--props', propsPath],
      { cwd: '/app', stdio: 'pipe' }
    );

    // Capture stderr for debugging
    let stderr = '';
    renderProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    // Wait for completion
    const exitCode = await new Promise<number>((resolve, reject) => {
      renderProcess.on('close', resolve);
      renderProcess.on('error', reject);
    });

    // Cleanup props file
    await unlink(propsPath).catch(() => {});

    if (exitCode !== 0) {
      console.error('Render stderr:', stderr);
      throw new Error(`Render failed with exit code ${exitCode}`);
    }

    // Read the video file
    const videoBuffer = await readFile(outputPath);

    // Cleanup video file
    await unlink(outputPath).catch(() => {});

    return videoBuffer;
  } catch (error) {
    // Cleanup on error
    await unlink(propsPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
    throw error;
  }
}

// Simple HTTP server using Bun
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Render endpoint
    if (url.pathname === '/render' && req.method === 'POST') {
      try {
        const props = await req.json() as RenderRequest;

        // Validate required fields
        if (!props.lines || !Array.isArray(props.lines) || props.lines.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Missing or invalid lines array' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (!props.title) {
          return new Response(
            JSON.stringify({ error: 'Missing required field: title' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Rendering video: ${props.title} (${props.lines.length} lines)`);
        const startTime = Date.now();

        const videoBuffer = await renderVideo(props);

        console.log(`Render complete in ${Date.now() - startTime}ms`);

        return new Response(videoBuffer, {
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': videoBuffer.length.toString(),
          },
        });
      } catch (error) {
        console.error('Render error:', error);
        return new Response(
          JSON.stringify({ error: 'Render failed', details: String(error) }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Video render server running on port ${PORT}`);
