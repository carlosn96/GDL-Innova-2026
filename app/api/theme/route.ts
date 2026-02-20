import { NextResponse } from 'next/server';
import { fetchThemeSnapshot, snapshotToCSS } from '@/lib/theme-css.server';

// Siempre dinámico — lee RTDB en cada petición (o desde caché de Next.js)
export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = await fetchThemeSnapshot();

  if (!snapshot) {
    // Firebase no configurado o sin datos: devuelve hoja vacía sin romper nada
    return new NextResponse('/* gdlinova-theme: no data */', {
      headers: { 'Content-Type': 'text/css; charset=utf-8' },
    });
  }

  const css = snapshotToCSS(snapshot);

  return new NextResponse(css, {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      // 60 s en caché de CDN + permite servir stale hasta 5 min mientras revalida
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}
