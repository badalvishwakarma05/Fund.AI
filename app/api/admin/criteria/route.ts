import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCriteria,
  getAllSchemes,
  getAllDocuments,
  getDbStats,
  updateCriterionReview,
  createCriterion,
  deleteCriterion,
  seedDatabase,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schemeId = searchParams.get('scheme_id');
    const reviewedOnly = searchParams.get('reviewed');

    let criteria = getAllCriteria();
    const schemes = getAllSchemes();
    const docs = getAllDocuments();
    const stats = getDbStats();

    if (schemeId && schemeId !== 'all') {
      criteria = criteria.filter((c) => c.scheme_id === schemeId);
    }

    if (reviewedOnly === 'true') {
      criteria = criteria.filter((c) => c.reviewed_by_human);
    } else if (reviewedOnly === 'false') {
      criteria = criteria.filter((c) => !c.reviewed_by_human);
    }

    return NextResponse.json({
      success: true,
      criteria,
      schemes,
      docs,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch criteria' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, reviewed, updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Criterion ID is required' },
        { status: 400 }
      );
    }

    updateCriterionReview(id, reviewed, updates);
    const stats = getDbStats();

    return NextResponse.json({
      success: true,
      message: `Criterion ${id} updated`,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update criterion' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scheme_id,
      field_checked,
      operator,
      value,
      human_readable_text,
      source_doc_id,
      source_quote,
      source_page_or_section,
      extraction_confidence,
      reviewed_by_human,
    } = body;

    if (!scheme_id || !field_checked || !operator || !value || !human_readable_text) {
      return NextResponse.json(
        { success: false, error: 'Missing required criterion fields' },
        { status: 400 }
      );
    }

    const id = `c-${scheme_id}-${Date.now().toString(36)}`;
    createCriterion({
      id,
      scheme_id,
      field_checked,
      operator,
      value,
      human_readable_text,
      source_doc_id: source_doc_id || 'doc-guideline',
      source_quote: source_quote || '',
      source_page_or_section: source_page_or_section || 'Section 1.0',
      extraction_confidence: extraction_confidence ?? 1.0,
      reviewed_by_human: Boolean(reviewed_by_human),
    });

    return NextResponse.json({
      success: true,
      id,
      stats: getDbStats(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create criterion' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Criterion ID is required' },
        { status: 400 }
      );
    }

    deleteCriterion(id);
    return NextResponse.json({
      success: true,
      stats: getDbStats(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete criterion' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    seedDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database re-seeded from official seed snapshot',
      stats: getDbStats(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to re-seed database' },
      { status: 500 }
    );
  }
}
