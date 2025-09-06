import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { UpdateDocumentSchema } from '@/lib/validations';
import { handleError, successResponse, createActivityLog, getUserIdFromRequest } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await db.document.findUnique({
      where: { id },
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

    if (!document) {
      return handleError(new Error('Document not found'));
    }

    return successResponse(document);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = UpdateDocumentSchema.parse(body);
    
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return handleError(new Error('User not authenticated'));
    }

    // Check if document exists
    const existingDocument = await db.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return handleError(new Error('Document not found'));
    }

    // Update document
    const document = await db.document.update({
      where: { id },
      data: validatedData,
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
      `Document updated: ${document.name}`,
      userId,
      `Document information updated`,
      { documentId: document.id, category: document.category }
    );

    return successResponse(document, 'Document updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return handleError(new Error('User not authenticated'));
    }

    // Check if document exists
    const document = await db.document.findUnique({
      where: { id },
    });

    if (!document) {
      return handleError(new Error('Document not found'));
    }

    // Delete document
    await db.document.delete({
      where: { id },
    });

    // Create activity log
    await createActivityLog(
      'DOCUMENT_UPLOADED',
      `Document deleted: ${document.name}`,
      userId,
      `Document removed from system`,
      { documentId: document.id, fileName: document.fileName }
    );

    return successResponse(null, 'Document deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
