import { PrismaClient } from '../src/generated/prisma-sqlite';

const db = new PrismaClient();

async function seedSQLiteDatabase() {
  try {
    console.log('🌱 Seeding SQLite database...');

    // Clear existing data
    await db.activity.deleteMany({});
    await db.task.deleteMany({});
    await db.order.deleteMany({});
    await db.document.deleteMany({});
    await db.user.deleteMany({});

    // Create default user
    const user = await db.user.create({
      data: {
        id: 'default-user-id',
        name: 'SQLite Test User',
        email: 'sqlite@spencerdenim.com',
        role: 'admin',
        isActive: true,
      },
    });

    console.log('✅ Created default user');

    // Create sample orders
    const order1 = await db.order.create({
      data: {
        orderNumber: 'ORD-SQLite-001',
        client: 'SQLite Test Client 1',
        product: 'Denim Jeans - Blue',
        quantity: 100,
        shipDate: new Date('2025-10-15'),
        status: 'PENDING',
        progress: 25,
        createdById: user.id,
      },
    });

    const order2 = await db.order.create({
      data: {
        orderNumber: 'ORD-SQLite-002',
        client: 'SQLite Test Client 2',
        product: 'Denim Jacket - Black',
        quantity: 50,
        shipDate: new Date('2025-11-01'),
        status: 'PENDING',
        progress: 60,
        createdById: user.id,
      },
    });

    console.log('✅ Created sample orders');

    // Create sample tasks
    await db.task.create({
      data: {
        title: 'SQLite Database Setup Task',
        description: 'Test task for SQLite database functionality',
        status: 'PENDING',
        priority: 'high',
        category: 'development',
        assignedToId: user.id,
        createdById: user.id,
        orderId: order1.id,
        dueDate: new Date('2025-10-01'),
      },
    });

    await db.task.create({
      data: {
        title: 'SQLite Data Validation',
        description: 'Validate data integrity in SQLite database',
        status: 'IN_PROGRESS',
        priority: 'medium',
        category: 'testing',
        assignedToId: user.id,
        createdById: user.id,
        orderId: order2.id,
        dueDate: new Date('2025-10-05'),
      },
    });

    await db.task.create({
      data: {
        title: 'Export Feature Testing',
        description: 'Test Excel export functionality with SQLite',
        status: 'COMPLETED',
        priority: 'low',
        category: 'testing',
        assignedToId: user.id,
        createdById: user.id,
        dueDate: new Date('2025-09-25'),
      },
    });

    console.log('✅ Created sample tasks');

    // Create sample activities
    await db.activity.create({
      data: {
        type: 'database_switch',
        title: 'Database Switch',
        description: 'Switched to SQLite database',
        userId: user.id,
        metadata: JSON.stringify({ previousDatabase: 'postgres', newDatabase: 'sqlite' }),
      },
    });

    console.log('✅ Created sample activities');
    console.log('🎉 SQLite database seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding SQLite database:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

if (require.main === module) {
  seedSQLiteDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedSQLiteDatabase;