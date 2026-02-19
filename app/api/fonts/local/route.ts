import { promises as fs } from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

interface LocalFontDto {
  id: string;
  label: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace';
  format: 'woff2' | 'woff' | 'truetype' | 'opentype';
  dataUrl: string;
}

function toFormat(fileName: string): LocalFontDto['format'] {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'woff2') return 'woff2';
  if (ext === 'woff') return 'woff';
  if (ext === 'otf') return 'opentype';
  return 'truetype';
}

function toFamily(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toId(fileName: string): string {
  return `local-folder-${fileName
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;
}

function toMime(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'ttf';
  if (ext === 'woff2') return 'font/woff2';
  if (ext === 'woff') return 'font/woff';
  if (ext === 'otf') return 'font/otf';
  return 'font/ttf';
}

function sanitizeFileName(fileName: string): string {
  const parsed = path.parse(fileName);
  const base = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '') || 'font-local';
  const ext = parsed.ext.toLowerCase();
  return `${base}${ext}`;
}

async function ensureUniqueFileName(dir: string, fileName: string): Promise<string> {
  const parsed = path.parse(fileName);
  let attempt = 0;

  while (true) {
    const candidate = attempt === 0 ? `${parsed.name}${parsed.ext}` : `${parsed.name}-${attempt}${parsed.ext}`;
    try {
      await fs.access(path.join(dir, candidate));
      attempt += 1;
    } catch {
      return candidate;
    }
  }
}

function toDto(fileName: string, raw: Buffer): LocalFontDto {
  const base64 = raw.toString('base64');
  return {
    id: toId(fileName),
    label: fileName,
    family: toFamily(fileName),
    category: 'display',
    format: toFormat(fileName),
    dataUrl: `data:${toMime(fileName)};base64,${base64}`,
  };
}

export async function GET() {
  try {
    const localFontsDir = path.join(process.cwd(), 'app', 'fonts', 'local');
    await fs.mkdir(localFontsDir, { recursive: true });
    const files = await fs.readdir(localFontsDir);
    const allowed = files.filter((file) => /\.(woff2|woff|ttf|otf)$/i.test(file));

    const fonts = await Promise.all(
      allowed.map(async (fileName): Promise<LocalFontDto> => {
        const filePath = path.join(localFontsDir, fileName);
        const raw = await fs.readFile(filePath);
        return toDto(fileName, raw);
      }),
    );

    return NextResponse.json({ fonts });
  } catch {
    return NextResponse.json({ fonts: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('font');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No se recibió un archivo de fuente.' }, { status: 400 });
    }

    if (!/\.(woff2|woff|ttf|otf)$/i.test(file.name)) {
      return NextResponse.json({ error: 'Formato no soportado. Usa .woff2, .woff, .ttf o .otf.' }, { status: 400 });
    }

    const localFontsDir = path.join(process.cwd(), 'app', 'fonts', 'local');
    await fs.mkdir(localFontsDir, { recursive: true });

    const sanitized = sanitizeFileName(file.name);
    const uniqueName = await ensureUniqueFileName(localFontsDir, sanitized);
    const targetPath = path.join(localFontsDir, uniqueName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetPath, bytes);

    return NextResponse.json({ font: toDto(uniqueName, bytes) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar la fuente en app/fonts/local.' }, { status: 500 });
  }
}
