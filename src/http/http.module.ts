import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { BudgetsModule } from './budgets/budgets.module';
import { CategoriesModule } from './categories/categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MetadataModule } from './metadata/metadata.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    CategoriesModule,
    MetadataModule,
    TransactionsModule,
    BudgetsModule,
    DashboardModule,
    AdminModule,
  ],
})
export class HttpModule {}
