import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAssets } from '@/lib/generator';

const Input = z.object({
  businessName: z.string().min(1),
  industry: z.string().min(1),
  targetAudience: z.string().min(1),
  offer: z.string().min(1),
  tone: z.string().min(1),
  website: z.string().optional().nullable(),
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = Input.parse(json);

    const result = await generateAssets(input);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Invalid request' },
      { status: 400 },
    );
  }
}
