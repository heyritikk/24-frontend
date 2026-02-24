import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Budget, BudgetService } from '../../services/budget.service';
import { Expense, ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  userName: string = '';
  showProfileMenu = false;

  budgets: Budget[] = [];
  expenses: Expense[] = [];

  isLoading = false;

  constructor(
    private budgetService: BudgetService,
    private expenseService: ExpenseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || 'Admin';
    this.loadData();
  }

  private loadData() {
    this.isLoading = true;

    this.budgetService.getAllBudgets().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
        this.tryFinishLoading();
      },
      error: () => {
        this.tryFinishLoading();
      }
    });

    this.expenseService.getAllExpenses().subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.tryFinishLoading();
      },
      error: () => {
        this.tryFinishLoading();
      }
    });
  }

  private tryFinishLoading() {
    // For simplicity, just clear loading state once any call returns.
    this.isLoading = false;
  }

  get totalBudgets(): number {
    return this.budgets.length;
  }

  get totalAllocated(): number {
    return this.budgets.reduce((sum, b) => sum + (b.amountAllocated || 0), 0);
  }

  get totalExpenses(): number {
    return this.expenses.length;
  }

  get totalSpent(): number {
    return this.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  get pendingExpenses(): number {
    return this.expenses.filter(e => e.status === 'Pending').length;
  }

  get approvedExpenses(): number {
    return this.expenses.filter(e => e.status === 'Approved').length;
  }

  get rejectedExpenses(): number {
    return this.expenses.filter(e => e.status === 'Rejected').length;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  navigateToProfile() {
    this.showProfileMenu = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

