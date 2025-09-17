import { NextRequest, NextResponse } from 'next/server';
import { DynamicSQLiteService } from '@/lib/dynamic-sqlite-service';
import { TableConfigService } from '@/lib/table-config-service';

// Initialize database on first import
DynamicSQLiteService.initialize();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
    const sort = searchParams.get('sort') || undefined;
    const sortOrder = searchParams.get('sortOrder') as 'ASC' | 'DESC' || 'ASC';
    const search = searchParams.get('search') || undefined;

    // Parse filters
    const filters: Record<string, any> = {};
    for (const [key, value] of searchParams.entries()) {
      if (!['limit', 'offset', 'sort', 'sortOrder', 'search'].includes(key) && value) {
        filters[key] = value;
      }
    }

    // Get specific record if ID is provided
    const id = searchParams.get('id');
    if (id) {
      const record = DynamicSQLiteService.getRecord(table, id);
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Record not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Get all records with filters
    const result = DynamicSQLiteService.getRecords(table, {
      limit,
      offset,
      sort,
      sortOrder,
      filters,
      search
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in dynamic table GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const data = await request.json();

    const result = DynamicSQLiteService.createRecord(table, data);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in dynamic table POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Record ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const result = DynamicSQLiteService.updateRecord(table, id, data);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in dynamic table PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Record ID is required' },
        { status: 400 }
      );
    }

    const result = DynamicSQLiteService.deleteRecord(table, id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in dynamic table DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}