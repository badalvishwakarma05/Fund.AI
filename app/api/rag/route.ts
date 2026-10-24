import { NextRequest, NextResponse } from 'next/server';
import { querySchemeKnowledge } from '@/lib/rag/pipeline';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, schemeId } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid question string is required.' },
        { status: 400 }
      );
    }

    const result = await querySchemeKnowledge(question, schemeId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('RAG query error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'RAG query failed' },
      { status: 500 }
    );
  }
}
