import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { handleError, successResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Task statistics
    const [
      totalTasks,
      pendingTasks,
      completedTasks,
      urgentTasks,
      tasksThisMonth,
      tasksLastMonth,
    ] = await Promise.all([
      db.task.count(),
      db.task.count({ where: { status: 'PENDING' } }),
      db.task.count({ where: { status: 'COMPLETED' } }),
      db.task.count({ where: { status: 'URGENT' } }),
      db.task.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.task.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    // Order statistics
    const [
      totalOrders,
      activeOrders,
      shippedOrders,
      ordersThisMonth,
      ordersLastMonth,
    ] = await Promise.all([
      db.order.count(),
      db.order.count({
        where: {
          status: {
            in: ['PENDING', 'SAMPLING', 'CUTTING', 'PRODUCTION', 'QUALITY_CHECK', 'PACKING'],
          },
        },
      }),
      db.order.count({ where: { status: 'SHIPPED' } }),
      db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.order.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    // Document statistics
    const [totalDocuments, documentsThisMonth] = await Promise.all([
      db.document.count(),
      db.document.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    // User statistics
    const totalUsers = await db.user.count();

    // Recent activities
    const recentActivities = await db.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Task distribution by category
    const tasksByCategory = await db.task.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    // Task distribution by status
    const tasksByStatus = await db.task.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Task distribution by priority
    const tasksByPriority = await db.task.groupBy({
      by: ['priority'],
      _count: {
        priority: true,
      },
    });

    // Order distribution by status
    const ordersByStatus = await db.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate monthly growth rates
    const taskGrowthRate = tasksLastMonth > 0 
      ? Math.round(((tasksThisMonth - tasksLastMonth) / tasksLastMonth) * 100)
      : 0;

    const orderGrowthRate = ordersLastMonth > 0
      ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100)
      : 0;

    // On-time delivery calculation (mock calculation based on shipped orders)
    const onTimeDeliveryRate = 94; // This would be calculated based on actual delivery dates

    const stats = {
      overview: {
        totalTasks,
        pendingTasks,
        completedTasks,
        urgentTasks,
        totalOrders,
        activeOrders,
        shippedOrders,
        totalDocuments,
        totalUsers,
        completionRate,
        onTimeDeliveryRate,
      },
      growth: {
        taskGrowthRate,
        orderGrowthRate,
        tasksThisMonth,
        ordersThisMonth,
        documentsThisMonth,
      },
      distributions: {
        tasksByCategory: tasksByCategory.map((item: any) => ({
          category: item.category,
          count: item._count.category,
        })),
        tasksByStatus: tasksByStatus.map((item: any) => ({
          status: item.status,
          count: item._count.status,
        })),
        ordersByStatus: ordersByStatus.map((item: any) => ({
          status: item.status,
          count: item._count.status,
        })),
      },
      tasksByStatus: tasksByStatus.map((item: any) => ({
        status: item.status,
        count: item._count.status,
      })),
      tasksByPriority: tasksByPriority.map((item: any) => ({
        priority: item.priority,
        count: item._count.priority,
      })),
      tasksByCategory: tasksByCategory.map((item: any) => ({
        category: item.category,
        count: item._count.category,
      })),
      recentActivities,
    };

    return successResponse(stats);
  } catch (error) {
    return handleError(error);
  }
}
