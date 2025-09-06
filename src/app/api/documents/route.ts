import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { CreateDocumentSchema, DocumentFilterSchema, PaginationSchema } from '@/lib/validations';
import { handleError, successResponse, getQueryParams, getPaginationMeta, buildWhereClause, createActivityLog, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const queryParams = getQueryParams(request);
    
    // Validate query parameters
    const pagination = PaginationSchema.parse({
      page: queryParams.page,
      limit: queryParams.limit,
    });
    
    const filters = DocumentFilterSchema.parse({
      category: queryParams.category,
      orderId: queryParams.orderId,
      search: queryParams.search,
    });

    // Build where clause
    const where = buildWhereClause(filters);

    // Get total count
    const total = await db.document.count({ where });

    // Get documents with pagination
    const documents = await db.document.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            client: true,
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    const paginationMeta = getPaginationMeta(total, pagination.page, pagination.limit);

    return successResponse({
      documents,
      pagination: paginationMeta,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateDocumentSchema.parse(body);
    
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return handleError(new Error('User not authenticated'));
    }

    // Create document
    const document = await db.document.create({
      data: {
        ...validatedData,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            client: true,
            product: true,
          },
        },
      },
    });

    // Create activity log
    await createActivityLog(
      'DOCUMENT_UPLOADED',
      `Document uploaded: ${document.name}`,
      userId,
      `New ${document.category} document uploaded`,
      { documentId: document.id, category: document.category, fileName: document.fileName }
    );

    return successResponse(document, 'Document uploaded successfully');
  } catch (error) {
    return handleError(error);
  }
}
