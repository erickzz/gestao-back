import { Injectable } from '@nestjs/common';
import { Recurrence, TransactionStatus, TransactionType } from 'generated/prisma/client';
import {
  addMonths,
  addQuarters,
  addYears,
  endOfMonth,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { PrismaService } from '../../prisma.service';
import type { Prisma } from 'generated/prisma/client';

type TransactionRow = {
  id: string;
  type: string;
  value: Prisma.Decimal;
  date: Date;
  recurrence: string;
  categoryId: string;
  status: string;
  category: { id: string; name: string; color: string; type: string };
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private sumRecurringUpTo(tx: TransactionRow, endDate: Date): number {
    if (tx.recurrence === Recurrence.NONE) {
      const d = new Date(tx.date);
      return d <= endDate ? Number(tx.value) : 0;
    }
    const start = new Date(tx.date);
    if (start > endDate) return 0;

    let total = 0;
    let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    while (current <= endDate) {
      total += Number(tx.value);
      if (tx.recurrence === Recurrence.MONTHLY) {
        current = addMonths(current, 1);
      } else if (tx.recurrence === Recurrence.QUARTERLY) {
        current = addQuarters(current, 1);
      } else if (tx.recurrence === Recurrence.ANNUAL) {
        current = addYears(current, 1);
      } else {
        break;
      }
    }
    return total;
  }

  private expandRecurringForMonth(
    tx: TransactionRow,
    monthStart: Date,
    monthEnd: Date,
  ): number {
    if (tx.recurrence === Recurrence.NONE) {
      const d = new Date(tx.date);
      return d >= monthStart && d <= monthEnd ? Number(tx.value) : 0;
    }
    const start = new Date(tx.date);
    if (start > monthEnd) return 0;

    let count = 0;
    let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    while (current <= monthEnd) {
      if (current >= monthStart) {
        count++;
      }
      if (tx.recurrence === Recurrence.MONTHLY) {
        current = addMonths(current, 1);
      } else if (tx.recurrence === Recurrence.QUARTERLY) {
        current = addQuarters(current, 1);
      } else if (tx.recurrence === Recurrence.ANNUAL) {
        current = addYears(current, 1);
      } else {
        break;
      }
    }
    return count * Number(tx.value);
  }

  private async getTransactionsForRange(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<TransactionRow[]> {
    const rows = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { lte: to },
        status: TransactionStatus.PAID,
      },
      select: {
        id: true,
        type: true,
        value: true,
        date: true,
        recurrence: true,
        categoryId: true,
        status: true,
        category: { select: { id: true, name: true, color: true, type: true } },
      },
    });
    return rows as unknown as TransactionRow[];
  }

  async getSummary(userId: string, month: number, year: number) {
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));
    const today = new Date();

    const rangeEnd = today > monthEnd ? today : monthEnd;
    const allTx = await this.getTransactionsForRange(
      userId,
      new Date(0),
      rangeEnd,
    );

    let balance = 0;
    let incomeMonth = 0;
    let expensesMonth = 0;

    for (const tx of allTx) {
      const amtBalance = this.sumRecurringUpTo(tx, today);
      if (tx.type === TransactionType.INCOME) balance += amtBalance;
      else balance -= amtBalance;

      const amtMonth = this.expandRecurringForMonth(tx, monthStart, monthEnd);
      if (tx.type === TransactionType.INCOME) incomeMonth += amtMonth;
      else expensesMonth += amtMonth;
    }

    const prevMonth = subMonths(monthStart, 1);
    let incomePrev = 0;
    let expensesPrev = 0;
    for (const tx of allTx) {
      const amt = this.expandRecurringForMonth(
        tx,
        startOfMonth(prevMonth),
        endOfMonth(prevMonth),
      );
      if (tx.type === TransactionType.INCOME) incomePrev += amt;
      else expensesPrev += amt;
    }

    const incomeDelta =
      incomePrev > 0
        ? ((incomeMonth - incomePrev) / incomePrev) * 100
        : incomeMonth > 0
          ? 100
          : 0;
    const expensesDelta =
      expensesPrev > 0
        ? ((expensesMonth - expensesPrev) / expensesPrev) * 100
        : expensesMonth > 0
          ? 100
          : 0;

    return {
      balance,
      income: incomeMonth,
      expenses: expensesMonth,
      incomeDelta,
      expensesDelta,
    };
  }

  async getExpensesByCategory(userId: string, month: number, year: number) {
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    const allTx = await this.getTransactionsForRange(
      userId,
      new Date(0),
      monthEnd,
    );
    const expenseTx = allTx.filter((t) => t.type === TransactionType.EXPENSE);

    const byCategory = new Map<
      string,
      { categoryId: string; name: string; color: string; total: number }
    >();

    for (const tx of expenseTx) {
      const amt = this.expandRecurringForMonth(tx, monthStart, monthEnd);
      if (amt <= 0) continue;

      const existing = byCategory.get(tx.categoryId);
      if (existing) {
        existing.total += amt;
      } else {
        byCategory.set(tx.categoryId, {
          categoryId: tx.categoryId,
          name: tx.category.name,
          color: tx.category.color,
          total: amt,
        });
      }
    }

    return Array.from(byCategory.values()).sort((a, b) => b.total - a.total);
  }

  async getMonthlyEvolution(userId: string, months: number = 12) {
    const now = new Date();
    const result: { month: number; year: number; income: number; expenses: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = subMonths(now, i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const summary = await this.getSummary(userId, m, y);
      result.push({
        month: m,
        year: y,
        income: summary.income,
        expenses: summary.expenses,
      });
    }
    return result;
  }

  async getBudgetStatus(userId: string, month: number, year: number) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    });

    const expensesByCat = await this.getExpensesByCategory(userId, month, year);
    const expenseMap = new Map(expensesByCat.map((e) => [e.categoryId, e.total]));

    return budgets.map((b) => {
      const spent = expenseMap.get(b.categoryId) ?? 0;
      const limit = Number(b.limit);
      const percentUsed = limit > 0 ? (spent / limit) * 100 : 0;
      const alert =
        percentUsed >= 100 ? 'danger' : percentUsed >= 80 ? 'warning' : 'ok';

      return {
        budgetId: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        categoryColor: b.category.color,
        limit,
        spent,
        percentUsed: Math.round(percentUsed * 100) / 100,
        alert,
      };
    });
  }

  async getAggregated(
    userId: string,
    month: number,
    year: number,
    months: number = 12,
  ) {
    const [summary, expensesByCategory, monthlyEvolution, budgetStatus] =
      await Promise.all([
        this.getSummary(userId, month, year),
        this.getExpensesByCategory(userId, month, year),
        this.getMonthlyEvolution(userId, months),
        this.getBudgetStatus(userId, month, year),
      ]);

    return {
      summary,
      expensesByCategory,
      monthlyEvolution,
      budgetStatus,
    };
  }
}
