import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create users with passwords
  const users = await Promise.all([
    db.user.upsert({
      where: { email: 'madusanka@spencerdenimsl.com' },
      update: {},
      create: {
        email: 'madusanka@spencerdenimsl.com',
        name: 'T. Madusanka',
        role: 'Senior Merchandiser',
        phone: '+94751591577',
        password: hashedPassword,
      },
    }),
    db.user.upsert({
      where: { email: 'production@spencerdenimsl.com' },
      update: {},
      create: {
        email: 'production@spencerdenimsl.com',
        name: 'Production Manager',
        role: 'Production Manager',
        phone: '+94771234567',
        password: hashedPassword,
      },
    }),
    db.user.upsert({
      where: { email: 'quality@spencerdenimsl.com' },
      update: {},
      create: {
        email: 'quality@spencerdenimsl.com',
        name: 'Quality Controller',
        role: 'Quality Controller',
        phone: '+94777654321',
        password: hashedPassword,
      },
    }),
    // Add a test admin user
    db.user.upsert({
      where: { email: 'admin@spencer.com' },
      update: {},
      create: {
        email: 'admin@spencer.com',
        name: 'Admin User',
        role: 'Administrator',
        phone: '+94777000000',
        password: hashedPassword,
      },
    }),
  ]);

  console.log('✅ Users created');

  // Create orders
  const orders = await Promise.all([
    db.order.upsert({
      where: { orderNumber: 'ORD-001' },
      update: {},
      create: {
        orderNumber: 'ORD-001',
        client: 'Fashion Retail Co.',
        product: "Women's Summer Dress",
        quantity: 5000,
        shipDate: new Date('2025-12-15'),
        status: 'PRODUCTION',
        progress: 65,
        createdById: users[0].id,
      },
    }),
    db.order.upsert({
      where: { orderNumber: 'ORD-002' },
      update: {},
      create: {
        orderNumber: 'ORD-002',
        client: 'Urban Outfitters',
        product: "Men's Casual Shirt",
        quantity: 8000,
        shipDate: new Date('2025-12-05'),
        status: 'CUTTING',
        progress: 45,
        createdById: users[0].id,
      },
    }),
    db.order.upsert({
      where: { orderNumber: 'ORD-003' },
      update: {},
      create: {
        orderNumber: 'ORD-003',
        client: 'Luxury Brands',
        product: 'Designer Jacket',
        quantity: 1200,
        shipDate: new Date('2025-11-30'),
        status: 'SAMPLING',
        progress: 25,
        createdById: users[0].id,
      },
    }),
    db.order.upsert({
      where: { orderNumber: 'ORD-004' },
      update: {},
      create: {
        orderNumber: 'ORD-004',
        client: 'Sportswear Inc.',
        product: 'Training Pants',
        quantity: 10000,
        shipDate: new Date('2025-11-25'),
        status: 'SHIPPED',
        progress: 100,
        createdById: users[0].id,
      },
    }),
  ]);

  console.log('✅ Orders created');

  // Create tasks
  const tasks = await Promise.all([
    db.task.create({
      data: {
        title: 'Review tech pack for summer dress collection',
        description: 'Complete technical review of all specifications and measurements for the new summer dress line.',
        status: 'PENDING',
        priority: 'HIGH',
        category: 'SAMPLING',
        dueDate: new Date('2025-09-15'),
        createdById: users[0].id,
        assignedToId: users[1].id,
        orderId: orders[0].id,
      },
    }),
    db.task.create({
      data: {
        title: 'Quality inspection for batch #4582',
        description: 'Conduct thorough quality inspection for the latest production batch of casual shirts.',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        category: 'QUALITY',
        dueDate: new Date('2025-09-10'),
        createdById: users[0].id,
        assignedToId: users[2].id,
        orderId: orders[1].id,
      },
    }),
    db.task.create({
      data: {
        title: 'Prepare shipping documentation',
        description: 'Generate all required shipping documents and customs forms for training pants order.',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        category: 'SHIPPING',
        dueDate: new Date('2025-09-05'),
        completedAt: new Date('2025-09-04'),
        createdById: users[0].id,
        assignedToId: users[0].id,
        orderId: orders[3].id,
      },
    }),
    db.task.create({
      data: {
        title: 'Update production schedule',
        description: 'Revise production timeline based on new order priorities and resource availability.',
        status: 'URGENT',
        priority: 'URGENT',
        category: 'PRODUCTION',
        dueDate: new Date('2025-09-08'),
        createdById: users[0].id,
        assignedToId: users[1].id,
      },
    }),
    db.task.create({
      data: {
        title: 'Cost analysis for designer jacket',
        description: 'Perform detailed cost breakdown analysis for the luxury designer jacket project.',
        status: 'PENDING',
        priority: 'MEDIUM',
        category: 'COSTING',
        dueDate: new Date('2025-09-20'),
        createdById: users[0].id,
        assignedToId: users[0].id,
        orderId: orders[2].id,
      },
    }),
  ]);

  console.log('✅ Tasks created');

  // Create documents
  const documents = await Promise.all([
    db.document.create({
      data: {
        name: 'Summer Dress Tech Pack v2.1',
        fileName: 'summer_dress_tech_pack_v2.1.pdf',
        filePath: '/uploads/tech_packs/summer_dress_tech_pack_v2.1.pdf',
        fileSize: 2048576,
        mimeType: 'application/pdf',
        category: 'TECH_PACK',
        uploadedById: users[0].id,
        orderId: orders[0].id,
      },
    }),
    db.document.create({
      data: {
        name: 'Purchase Order - Urban Outfitters',
        fileName: 'po_urban_outfitters_ord002.pdf',
        filePath: '/uploads/purchase_orders/po_urban_outfitters_ord002.pdf',
        fileSize: 1024768,
        mimeType: 'application/pdf',
        category: 'PURCHASE_ORDER',
        uploadedById: users[0].id,
        orderId: orders[1].id,
      },
    }),
    db.document.create({
      data: {
        name: 'Quality Report - Batch #4576',
        fileName: 'quality_report_batch_4576.pdf',
        filePath: '/uploads/quality_reports/quality_report_batch_4576.pdf',
        fileSize: 512384,
        mimeType: 'application/pdf',
        category: 'QUALITY_REPORT',
        uploadedById: users[2].id,
        orderId: orders[3].id,
      },
    }),
    db.document.create({
      data: {
        name: 'Cost Sheet - Designer Jacket',
        fileName: 'cost_sheet_designer_jacket.xlsx',
        filePath: '/uploads/cost_sheets/cost_sheet_designer_jacket.xlsx',
        fileSize: 256192,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        category: 'COST_SHEET',
        uploadedById: users[0].id,
        orderId: orders[2].id,
      },
    }),
  ]);

  console.log('✅ Documents created');

  // Create activities
  const activities = await Promise.all([
    db.activity.create({
      data: {
        type: 'TASK_CREATED',
        title: 'New task created',
        description: 'Review tech pack for summer dress collection',
        userId: users[0].id,
        metadata: { taskId: tasks[0].id, category: 'SAMPLING' },
      },
    }),
    db.activity.create({
      data: {
        type: 'ORDER_CREATED',
        title: 'New order received',
        description: 'Order from Fashion Retail Co. for 5,000 summer dresses',
        userId: users[0].id,
        metadata: { orderId: orders[0].id, client: 'Fashion Retail Co.' },
      },
    }),
    db.activity.create({
      data: {
        type: 'TASK_COMPLETED',
        title: 'Task completed',
        description: 'Shipping documentation prepared',
        userId: users[0].id,
        metadata: { taskId: tasks[2].id, category: 'SHIPPING' },
      },
    }),
    db.activity.create({
      data: {
        type: 'DOCUMENT_UPLOADED',
        title: 'Document uploaded',
        description: 'Tech pack uploaded for summer dress collection',
        userId: users[0].id,
        metadata: { documentId: documents[0].id, category: 'TECH_PACK' },
      },
    }),
  ]);

  console.log('✅ Activities created');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
