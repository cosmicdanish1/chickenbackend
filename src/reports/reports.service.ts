import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PurchaseOrder } from '../purchases/entities/purchase-order.entity';
import { Sale } from '../sales/sale.entity';
import { Expense } from '../expenses/expense.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseRepository: Repository<PurchaseOrder>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async getPurchaseReport(startDate?: string, endDate?: string) {
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.orderDate = Between(new Date(startDate), new Date(endDate));
    }

    const purchases = await this.purchaseRepository.find({
      where: whereClause,
      order: { orderDate: 'DESC' },
    });

    const summary = {
      totalOrders: purchases.length,
      totalAmount: purchases.reduce((sum, p) => sum + parseFloat(p.totalAmount as any), 0),
      totalNetAmount: purchases.reduce((sum, p) => sum + parseFloat(p.netAmount as any), 0),
      totalPaid: purchases.filter(p => p.purchasePaymentStatus === 'paid').length,
      totalPending: purchases.filter(p => p.purchasePaymentStatus === 'pending').length,
      totalPartial: purchases.filter(p => p.purchasePaymentStatus === 'partial').length,
    };

    return {
      summary,
      purchases,
      dateRange: { startDate, endDate },
    };
  }

  async getSalesReport(startDate?: string, endDate?: string) {
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.saleDate = Between(new Date(startDate), new Date(endDate));
    }

    const sales = await this.saleRepository.find({
      where: whereClause,
      order: { saleDate: 'DESC' },
    });

    const summary = {
      totalSales: sales.length,
      totalAmount: sales.reduce((sum, s) => sum + parseFloat(s.totalAmount as any), 0),
      totalNetAmount: sales.reduce((sum, s) => sum + parseFloat(s.netAmount as any), 0),
      totalPaid: sales.filter(s => s.paymentStatus === 'paid').length,
      totalPending: sales.filter(s => s.paymentStatus === 'pending').length,
      totalPartial: sales.filter(s => s.paymentStatus === 'partial').length,
    };

    return {
      summary,
      sales,
      dateRange: { startDate, endDate },
    };
  }

  async getMortalityReport(startDate?: string, endDate?: string) {
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.orderDate = Between(new Date(startDate), new Date(endDate));
    }

    const purchases = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .where(whereClause)
      .andWhere('purchase.mortalityDeduction > 0')
      .orderBy('purchase.orderDate', 'DESC')
      .getMany();

    const summary = {
      totalOrders: purchases.length,
      totalMortalityDeduction: purchases.reduce(
        (sum, p) => sum + parseFloat(p.mortalityDeduction as any || '0'), 
        0
      ),
      averageMortalityPerOrder: purchases.length > 0 
        ? purchases.reduce((sum, p) => sum + parseFloat(p.mortalityDeduction as any || '0'), 0) / purchases.length
        : 0,
    };

    return {
      summary,
      purchases: purchases.map(p => ({
        orderNumber: p.orderNumber,
        orderDate: p.orderDate,
        supplierName: p.supplierName,
        totalWeight: p.totalWeight,
        mortalityDeduction: p.mortalityDeduction,
        netAmount: p.netAmount,
      })),
      dateRange: { startDate, endDate },
    };
  }

  async getProfitLossReport(startDate?: string, endDate?: string) {
    const whereClausePurchase: any = {};
    const whereClauseSale: any = {};
    const whereClauseExpense: any = {};
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      whereClausePurchase.orderDate = Between(start, end);
      whereClauseSale.saleDate = Between(start, end);
      whereClauseExpense.expenseDate = Between(start, end);
    }

    const purchases = await this.purchaseRepository.find({ where: whereClausePurchase });
    const sales = await this.saleRepository.find({ where: whereClauseSale });
    const expenses = await this.expenseRepository.find({ where: whereClauseExpense });

    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.netAmount as any), 0);
    const totalCost = purchases.reduce((sum, p) => sum + parseFloat(p.netAmount as any), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount as any), 0);
    
    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      summary: {
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        netProfit,
        profitMargin,
      },
      breakdown: {
        purchases: {
          count: purchases.length,
          total: totalCost,
        },
        sales: {
          count: sales.length,
          total: totalRevenue,
        },
        expenses: {
          count: expenses.length,
          total: totalExpenses,
          byCategory: this.groupExpensesByCategory(expenses),
        },
      },
      dateRange: { startDate, endDate },
    };
  }

  private groupExpensesByCategory(expenses: Expense[]) {
    const grouped: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = 0;
      }
      grouped[category] += parseFloat(expense.amount as any);
    });

    return grouped;
  }
}
