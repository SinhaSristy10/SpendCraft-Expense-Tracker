/**
 * Expense Tracker - Main Application Orchestrator
 * Connects DataStore, Validation, and Charts with all DOM interactions.
 */

import { DataStore, CATEGORIES, CURRENCIES, PAYMENT_METHODS, formatDateLocal } from './data.js';
import { Validator } from './validation.js';
import { ChartManager } from './charts.js';

class App {
  constructor() {
    this.store = new DataStore();
    this.charts = new ChartManager(this.store);

    this.currentMonth = this.getInitialMonth();
    this.searchQuery = '';
    this.categoryFilter = 'all';
    this.sortBy = 'date_desc';

    this.pendingDeleteId = null;
    this.isEditing = false;

    this.dom = {};
  }

  getInitialMonth() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }

  init() {
    this.cacheDomElements();
    this.initTheme();
    this.initCategoryDropdowns();
    this.initMonthInput();
    this.initCurrencySelect();
    this.bindEvents();

    this.charts.initCharts();
    this.render();
  }

  cacheDomElements() {
    this.dom = {
      // Navigation / Header
      currencySelect: document.getElementById('currencySelect'),
      selectedMonthInput: document.getElementById('selectedMonthInput'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      themeIcon: document.getElementById('themeIcon'),
      openAddModalBtn: document.getElementById('openAddModalBtn'),
      activeMonthDisplay: document.getElementById('activeMonthDisplay'),
      toggleAllMonthsBtn: document.getElementById('toggleAllMonthsBtn'),
      setBudgetBtn: document.getElementById('setBudgetBtn'),
      openDataModalBtn: document.getElementById('openDataModalBtn'),
      resetDemoBtn: document.getElementById('resetDemoBtn'),
      printBtn: document.getElementById('printBtn'),

      // KPIs
      kpiMonthTotal: document.getElementById('kpiMonthTotal'),
      kpiMomBadge: document.getElementById('kpiMomBadge'),
      kpiMomValue: document.getElementById('kpiMomValue'),
      kpiBudgetLimit: document.getElementById('kpiBudgetLimit'),
      kpiBudgetPctText: document.getElementById('kpiBudgetPctText'),
      kpiBudgetProgressBar: document.getElementById('kpiBudgetProgressBar'),
      kpiBudgetRemainingText: document.getElementById('kpiBudgetRemainingText'),
      kpiRemainingVal: document.getElementById('kpiRemainingVal'),
      budgetAlertTag: document.getElementById('budgetAlertTag'),
      kpiTodayTotal: document.getElementById('kpiTodayTotal'),
      kpiDailyAvg: document.getElementById('kpiDailyAvg'),
      kpiTopCategoryName: document.getElementById('kpiTopCategoryName'),
      kpiTopCategoryAmount: document.getElementById('kpiTopCategoryAmount'),
      kpiTopCategoryPercent: document.getElementById('kpiTopCategoryPercent'),
      topCategoryIconBox: document.getElementById('topCategoryIconBox'),
      topCategoryIcon: document.getElementById('topCategoryIcon'),

      // Filters & Search
      searchInput: document.getElementById('searchInput'),
      clearSearchBtn: document.getElementById('clearSearchBtn'),
      categoryFilter: document.getElementById('categoryFilter'),
      sortOrder: document.getElementById('sortOrder'),
      clearAllBtn: document.getElementById('clearAllBtn'),
      resultsCount: document.getElementById('resultsCount'),
      filteredTotalSum: document.getElementById('filteredTotalSum'),

      // Table & Empty state
      expenseTableBody: document.getElementById('expenseTableBody'),
      tableEmptyState: document.getElementById('tableEmptyState'),
      emptyStateAddBtn: document.getElementById('emptyStateAddBtn'),

      // Expense Modal
      expenseModal: document.getElementById('expenseModal'),
      expenseModalBackdrop: document.getElementById('expenseModalBackdrop'),
      closeExpenseModalBtn: document.getElementById('closeExpenseModalBtn'),
      cancelExpenseModalBtn: document.getElementById('cancelExpenseModalBtn'),
      expenseForm: document.getElementById('expenseForm'),
      modalTitle: document.getElementById('modalTitle'),
      modalIcon: document.getElementById('modalIcon'),
      saveButtonText: document.getElementById('saveButtonText'),
      expenseIdInput: document.getElementById('expenseIdInput'),
      expenseTitleInput: document.getElementById('expenseTitleInput'),
      expenseAmountInput: document.getElementById('expenseAmountInput'),
      expenseDateInput: document.getElementById('expenseDateInput'),
      expenseCategorySelect: document.getElementById('expenseCategorySelect'),
      expensePaymentSelect: document.getElementById('expensePaymentSelect'),
      expenseNotesInput: document.getElementById('expenseNotesInput'),
      currencySymbolLabel: document.getElementById('currencySymbolLabel'),
      dateTodayBtn: document.getElementById('dateTodayBtn'),
      dateYesterdayBtn: document.getElementById('dateYesterdayBtn'),
      titleError: document.getElementById('titleError'),
      amountError: document.getElementById('amountError'),
      dateError: document.getElementById('dateError'),
      categoryError: document.getElementById('categoryError'),

      // Budget Modal
      budgetModal: document.getElementById('budgetModal'),
      budgetModalBackdrop: document.getElementById('budgetModalBackdrop'),
      closeBudgetModalBtn: document.getElementById('closeBudgetModalBtn'),
      cancelBudgetModalBtn: document.getElementById('cancelBudgetModalBtn'),
      budgetForm: document.getElementById('budgetForm'),
      monthlyBudgetInput: document.getElementById('monthlyBudgetInput'),
      budgetError: document.getElementById('budgetError'),

      // Delete Modal
      deleteModal: document.getElementById('deleteModal'),
      deleteModalBackdrop: document.getElementById('deleteModalBackdrop'),
      cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
      confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
      deleteModalTitle: document.getElementById('deleteModalTitle'),
      deleteModalDesc: document.getElementById('deleteModalDesc'),

      // Data Modal
      dataModal: document.getElementById('dataModal'),
      dataModalBackdrop: document.getElementById('dataModalBackdrop'),
      closeDataModalBtn: document.getElementById('closeDataModalBtn'),
      exportCsvBtn: document.getElementById('exportCsvBtn'),
      exportJsonBtn: document.getElementById('exportJsonBtn'),
      importFileInput: document.getElementById('importFileInput'),

      // Toast Container
      toastContainer: document.getElementById('toastContainer')
    };
  }

  // --- Initial Setup & Populating Controls ---

  initCategoryDropdowns() {
    // Populate form select
    this.dom.expenseCategorySelect.innerHTML = '<option value="">-- Choose Category --</option>';
    // Populate filter select
    this.dom.categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    CATEGORIES.forEach(cat => {
      // For Add/Edit Form
      const formOpt = document.createElement('option');
      formOpt.value = cat.id;
      formOpt.textContent = cat.name;
      this.dom.expenseCategorySelect.appendChild(formOpt);

      // For Filters
      const filterOpt = document.createElement('option');
      filterOpt.value = cat.id;
      filterOpt.textContent = cat.name;
      this.dom.categoryFilter.appendChild(filterOpt);
    });
  }

  initMonthInput() {
    this.dom.selectedMonthInput.value = this.currentMonth;
    this.updateActiveMonthLabel();
  }

  initCurrencySelect() {
    this.dom.currencySelect.value = this.store.currentCurrency;
    this.updateCurrencyLabels();
  }

  updateCurrencyLabels() {
    const cur = this.store.getCurrencyInfo();
    if (this.dom.currencySymbolLabel) {
      this.dom.currencySymbolLabel.textContent = cur.symbol;
    }
    document.querySelectorAll('.currencySymbolDisplay').forEach(el => {
      el.textContent = cur.symbol;
    });
  }

  updateActiveMonthLabel() {
    if (this.currentMonth === 'all') {
      this.dom.activeMonthDisplay.textContent = 'All Time';
      if (this.dom.toggleAllMonthsBtn) {
        this.dom.toggleAllMonthsBtn.textContent = 'Filter by Month';
      }
      return;
    }
    const [year, month] = this.currentMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const label = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    this.dom.activeMonthDisplay.textContent = label;
    if (this.dom.toggleAllMonthsBtn) {
      this.dom.toggleAllMonthsBtn.textContent = 'View All Months';
    }
  }

  // --- Theme Management ---

  initTheme() {
    const savedTheme = localStorage.getItem('expense_tracker_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      this.dom.themeIcon.className = 'fa-solid fa-sun text-amber-400 text-sm sm:text-base';
    } else {
      document.documentElement.classList.remove('dark');
      this.dom.themeIcon.className = 'fa-solid fa-moon text-slate-600 dark:text-slate-300 text-sm sm:text-base';
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('expense_tracker_theme', isDark ? 'dark' : 'light');

    if (isDark) {
      this.dom.themeIcon.className = 'fa-solid fa-sun text-amber-400 text-sm sm:text-base';
    } else {
      this.dom.themeIcon.className = 'fa-solid fa-moon text-slate-600 dark:text-slate-300 text-sm sm:text-base';
    }

    this.charts.updateTheme();
    this.showToast(isDark ? 'Dark theme enabled' : 'Light theme enabled', 'info');
  }

  // --- Event Bindings ---

  bindEvents() {
    // Theme toggle
    this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // Currency Change
    this.dom.currencySelect.addEventListener('change', (e) => {
      this.store.setCurrency(e.target.value);
      this.updateCurrencyLabels();
      this.render();
      this.showToast(`Currency changed to ${e.target.value}`, 'info');
    });

    // Month Selector Change
    this.dom.selectedMonthInput.addEventListener('change', (e) => {
      if (e.target.value) {
        this.currentMonth = e.target.value;
        this.updateActiveMonthLabel();
        this.render();
      }
    });

    if (this.dom.toggleAllMonthsBtn) {
      this.dom.toggleAllMonthsBtn.addEventListener('click', () => {
        if (this.currentMonth === 'all') {
          this.currentMonth = this.dom.selectedMonthInput.value || this.getInitialMonth();
        } else {
          this.currentMonth = 'all';
        }
        this.updateActiveMonthLabel();
        this.render();
      });
    }

    // Search and Filters
    this.dom.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.dom.clearSearchBtn.classList.toggle('hidden', !this.searchQuery);
      this.renderTable();
    });

    this.dom.clearSearchBtn.addEventListener('click', () => {
      this.dom.searchInput.value = '';
      this.searchQuery = '';
      this.dom.clearSearchBtn.classList.add('hidden');
      this.renderTable();
    });

    this.dom.categoryFilter.addEventListener('change', (e) => {
      this.categoryFilter = e.target.value;
      this.renderTable();
    });

    this.dom.sortOrder.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.renderTable();
    });

    // Modals Open/Close
    this.dom.openAddModalBtn.addEventListener('click', () => this.openExpenseModal());
    this.dom.emptyStateAddBtn.addEventListener('click', () => this.openExpenseModal());
    this.dom.closeExpenseModalBtn.addEventListener('click', () => this.closeExpenseModal());
    this.dom.cancelExpenseModalBtn.addEventListener('click', () => this.closeExpenseModal());
    this.dom.expenseModalBackdrop.addEventListener('click', () => this.closeExpenseModal());

    // Expense Form Quick Dates
    this.dom.dateTodayBtn.addEventListener('click', () => {
      this.dom.expenseDateInput.value = formatDateLocal(new Date());
      Validator.clearFieldError(this.dom.expenseDateInput, this.dom.dateError);
    });

    this.dom.dateYesterdayBtn.addEventListener('click', () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      this.dom.expenseDateInput.value = formatDateLocal(d);
      Validator.clearFieldError(this.dom.expenseDateInput, this.dom.dateError);
    });

    // Expense Form Submission
    this.dom.expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));

    // Clear Form Errors on Input
    this.dom.expenseTitleInput.addEventListener('input', () => {
      Validator.clearFieldError(this.dom.expenseTitleInput, this.dom.titleError);
    });
    this.dom.expenseAmountInput.addEventListener('input', () => {
      Validator.clearFieldError(this.dom.expenseAmountInput, this.dom.amountError);
    });
    this.dom.expenseDateInput.addEventListener('change', () => {
      Validator.clearFieldError(this.dom.expenseDateInput, this.dom.dateError);
    });
    this.dom.expenseCategorySelect.addEventListener('change', () => {
      Validator.clearFieldError(this.dom.expenseCategorySelect, this.dom.categoryError);
    });

    // Budget Modal
    this.dom.setBudgetBtn.addEventListener('click', () => this.openBudgetModal());
    this.dom.closeBudgetModalBtn.addEventListener('click', () => this.closeBudgetModal());
    this.dom.cancelBudgetModalBtn.addEventListener('click', () => this.closeBudgetModal());
    this.dom.budgetModalBackdrop.addEventListener('click', () => this.closeBudgetModal());
    this.dom.budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));

    // Preset Budget Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.dom.monthlyBudgetInput.value = e.currentTarget.dataset.preset;
      });
    });

    // Delete Confirmation Modal
    this.dom.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
    this.dom.deleteModalBackdrop.addEventListener('click', () => this.closeDeleteModal());
    this.dom.confirmDeleteBtn.addEventListener('click', () => this.handleDeleteConfirm());

    // Clear All Records Button
    this.dom.clearAllBtn.addEventListener('click', () => {
      if (this.store.expenses.length === 0) {
        this.showToast('No expenses to clear.', 'info');
        return;
      }
      this.pendingDeleteId = '__ALL__';
      this.dom.deleteModalTitle.textContent = 'Clear All Records?';
      this.dom.deleteModalDesc.textContent = `Are you sure you want to permanently delete all ${this.store.expenses.length} expense transactions?`;
      this.dom.deleteModal.classList.remove('hidden');
    });

    // Demo Data Button
    this.dom.resetDemoBtn.addEventListener('click', () => {
      this.store.loadDemoData(true);
      this.render();
      this.showToast('Sample demo transactions loaded successfully!', 'success');
    });

    // Print Button
    this.dom.printBtn.addEventListener('click', () => {
      window.print();
    });

    // Data Backup / Export Modal
    this.dom.openDataModalBtn.addEventListener('click', () => this.openDataModal());
    this.dom.closeDataModalBtn.addEventListener('click', () => this.closeDataModal());
    this.dom.dataModalBackdrop.addEventListener('click', () => this.closeDataModal());

    this.dom.exportCsvBtn.addEventListener('click', () => this.handleExportCsv());
    this.dom.exportJsonBtn.addEventListener('click', () => this.handleExportJson());
    this.dom.importFileInput.addEventListener('change', (e) => this.handleImportJson(e));

    // Keyboard shortcuts (Escape closes modals)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeExpenseModal();
        this.closeBudgetModal();
        this.closeDeleteModal();
        this.closeDataModal();
      }
    });
  }

  // --- Render Orchestrator ---

  render() {
    this.renderKPIs();
    this.renderTable();
    this.charts.updateAll(this.currentMonth);
  }

  renderKPIs() {
    const calc = this.store.getCalculations(this.currentMonth);
    const cur = this.store.getCurrencyInfo();

    // 1. Month Total & MoM badge
    this.dom.kpiMonthTotal.textContent = this.store.formatAmount(calc.currentMonthTotal);

    if (calc.prevMonthTotal > 0) {
      const isIncrease = calc.momChangePercent > 0;
      const isDecrease = calc.momChangePercent < 0;
      const absVal = Math.abs(calc.momChangePercent).toFixed(1);

      this.dom.kpiMomBadge.className = `inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
        isIncrease
          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
      }`;
      this.dom.kpiMomBadge.innerHTML = `
        <i class="fa-solid ${isIncrease ? 'fa-arrow-trend-up' : isDecrease ? 'fa-arrow-trend-down' : 'fa-minus'}"></i>
        <span>${absVal}%</span>
      `;
    } else {
      this.dom.kpiMomBadge.className = 'inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
      this.dom.kpiMomBadge.innerHTML = '<span>New Month</span>';
    }

    // 2. Monthly Budget Card
    this.dom.kpiBudgetLimit.textContent = this.store.formatAmount(calc.budget);
    this.dom.kpiBudgetPctText.textContent = `${calc.rawBudgetPercentage.toFixed(0)}%`;
    this.dom.kpiBudgetProgressBar.style.width = `${calc.budgetPercentage}%`;

    // Budget progress color shifts: green -> yellow -> red
    if (calc.rawBudgetPercentage >= 100) {
      this.dom.kpiBudgetProgressBar.className = 'budget-bar-fill h-full bg-rose-500 rounded-full';
      this.dom.budgetAlertTag.classList.remove('hidden');
      this.dom.budgetAlertTag.textContent = 'Budget Exceeded!';
      this.dom.kpiRemainingVal.className = 'text-rose-600 dark:text-rose-400 font-semibold';
      this.dom.kpiRemainingVal.textContent = `-${this.store.formatAmount(calc.currentMonthTotal - calc.budget)}`;
    } else if (calc.rawBudgetPercentage >= 80) {
      this.dom.kpiBudgetProgressBar.className = 'budget-bar-fill h-full bg-amber-500 rounded-full';
      this.dom.budgetAlertTag.classList.remove('hidden');
      this.dom.budgetAlertTag.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      this.dom.budgetAlertTag.textContent = 'Near Limit';
      this.dom.kpiRemainingVal.className = 'text-amber-600 dark:text-amber-400 font-semibold';
      this.dom.kpiRemainingVal.textContent = this.store.formatAmount(calc.budgetRemaining);
    } else {
      this.dom.kpiBudgetProgressBar.className = 'budget-bar-fill h-full bg-emerald-500 rounded-full';
      this.dom.budgetAlertTag.classList.add('hidden');
      this.dom.kpiRemainingVal.className = 'text-emerald-600 dark:text-emerald-400 font-semibold';
      this.dom.kpiRemainingVal.textContent = this.store.formatAmount(calc.budgetRemaining);
    }

    // 3. Today's Spend & Daily Average
    this.dom.kpiTodayTotal.textContent = this.store.formatAmount(calc.todayTotal);
    this.dom.kpiDailyAvg.textContent = this.store.formatAmount(calc.dailyAverage);

    // 4. Top Category
    const categoryBreakdown = this.store.getCategoryBreakdown(this.currentMonth);
    if (categoryBreakdown.length > 0) {
      const top = categoryBreakdown[0];
      this.dom.kpiTopCategoryName.textContent = top.category.name;
      this.dom.kpiTopCategoryAmount.textContent = this.store.formatAmount(top.total);
      this.dom.kpiTopCategoryPercent.textContent = `${top.percentage.toFixed(1)}% of total`;
      this.dom.topCategoryIcon.className = `fa-solid ${top.category.icon}`;
      this.dom.topCategoryIconBox.style.color = top.category.color;
      this.dom.topCategoryIconBox.style.backgroundColor = top.category.bg;
    } else {
      this.dom.kpiTopCategoryName.textContent = 'None';
      this.dom.kpiTopCategoryAmount.textContent = this.store.formatAmount(0);
      this.dom.kpiTopCategoryPercent.textContent = '0% of total';
      this.dom.topCategoryIcon.className = 'fa-solid fa-chart-pie';
      this.dom.topCategoryIconBox.style.color = '';
      this.dom.topCategoryIconBox.style.backgroundColor = '';
    }
  }

  renderTable() {
    const filtered = this.store.getFilteredExpenses({
      search: this.searchQuery,
      category: this.categoryFilter,
      month: this.currentMonth,
      sortBy: this.sortBy
    });

    const totalSum = filtered.reduce((sum, item) => sum + item.amount, 0);

    this.dom.resultsCount.textContent = `Showing ${filtered.length} of ${this.store.expenses.length} expenses`;
    this.dom.filteredTotalSum.textContent = `Filtered Total: ${this.store.formatAmount(totalSum)}`;

    if (filtered.length === 0) {
      this.dom.expenseTableBody.innerHTML = '';
      this.dom.tableEmptyState.classList.remove('hidden');
      return;
    }

    this.dom.tableEmptyState.classList.add('hidden');
    this.dom.expenseTableBody.innerHTML = '';

    const fragment = document.createDocumentFragment();

    filtered.forEach(item => {
      const cat = CATEGORIES.find(c => c.id === item.category) || {
        name: 'Miscellaneous',
        icon: 'fa-tags',
        color: '#64748b',
        bg: 'rgba(100, 116, 139, 0.15)'
      };

      const pm = PAYMENT_METHODS.find(p => p.id === item.paymentMethod) || {
        name: 'Card',
        icon: 'fa-credit-card'
      };

      const [yNum, mNum, dNum] = item.date.split('-').map(Number);
      const formattedDate = new Date(yNum, mNum - 1, dNum).toLocaleDateString('default', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors animate-fade-in';

      row.innerHTML = `
        <td class="py-3 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
          <div class="font-medium text-slate-700 dark:text-slate-300">${formattedDate}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-semibold text-slate-900 dark:text-white">${this.escapeHtml(item.title)}</div>
          ${item.notes ? `<p class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">${this.escapeHtml(item.notes)}</p>` : ''}
        </td>
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="category-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style="color: ${cat.color}; background-color: ${cat.bg}">
            <i class="fa-solid ${cat.icon} text-[11px]"></i>
            <span>${cat.name}</span>
          </span>
        </td>
        <td class="py-3 px-4 whitespace-nowrap">
          <span class="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            <i class="fa-solid ${pm.icon} text-[10px]"></i>
            <span>${pm.name}</span>
          </span>
        </td>
        <td class="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-slate-900 dark:text-white">
          ${this.store.formatAmount(item.amount)}
        </td>
        <td class="py-3 px-4 whitespace-nowrap text-center">
          <div class="flex items-center justify-center gap-1">
            <button type="button" data-action="edit" data-id="${item.id}" title="Edit Expense" class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition">
              <i class="fa-solid fa-pen-to-square text-xs"></i>
            </button>
            <button type="button" data-action="delete" data-id="${item.id}" title="Delete Expense" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </td>
      `;

      fragment.appendChild(row);
    });

    this.dom.expenseTableBody.appendChild(fragment);

    // Bind action buttons on rows
    this.dom.expenseTableBody.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const id = e.currentTarget.dataset.id;
        if (action === 'edit') {
          this.openExpenseModal(id);
        } else if (action === 'delete') {
          this.openDeleteModal(id);
        }
      });
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Expense Form & Modal Handlers ---

  openExpenseModal(editId = null) {
    this.resetFormValidation();

    if (editId) {
      const item = this.store.getExpenseById(editId);
      if (!item) return;

      this.isEditing = true;
      this.dom.expenseIdInput.value = item.id;
      this.dom.expenseTitleInput.value = item.title;
      this.dom.expenseAmountInput.value = item.amount;
      this.dom.expenseDateInput.value = item.date;
      this.dom.expenseCategorySelect.value = item.category;
      this.dom.expensePaymentSelect.value = item.paymentMethod || 'card';
      this.dom.expenseNotesInput.value = item.notes || '';

      this.dom.modalTitle.textContent = 'Edit Expense';
      this.dom.modalIcon.className = 'fa-solid fa-pen-to-square text-sm';
      this.dom.saveButtonText.textContent = 'Update Expense';
    } else {
      this.isEditing = false;
      this.dom.expenseForm.reset();
      this.dom.expenseIdInput.value = '';
      this.dom.expenseDateInput.value = formatDateLocal(new Date());
      this.dom.expensePaymentSelect.value = 'card';

      this.dom.modalTitle.textContent = 'Add New Expense';
      this.dom.modalIcon.className = 'fa-solid fa-plus text-sm';
      this.dom.saveButtonText.textContent = 'Save Expense';
    }

    this.dom.expenseModal.classList.remove('hidden');
    setTimeout(() => this.dom.expenseTitleInput.focus(), 50);
  }

  closeExpenseModal() {
    this.dom.expenseModal.classList.add('hidden');
    this.resetFormValidation();
  }

  resetFormValidation() {
    Validator.clearFieldError(this.dom.expenseTitleInput, this.dom.titleError);
    Validator.clearFieldError(this.dom.expenseAmountInput, this.dom.amountError);
    Validator.clearFieldError(this.dom.expenseDateInput, this.dom.dateError);
    Validator.clearFieldError(this.dom.expenseCategorySelect, this.dom.categoryError);
  }

  handleExpenseSubmit(e) {
    e.preventDefault();

    const rawData = {
      title: this.dom.expenseTitleInput.value,
      amount: this.dom.expenseAmountInput.value,
      date: this.dom.expenseDateInput.value,
      category: this.dom.expenseCategorySelect.value,
      paymentMethod: this.dom.expensePaymentSelect.value,
      notes: this.dom.expenseNotesInput.value
    };

    const validation = Validator.validateExpenseForm(rawData);

    if (!validation.isValid) {
      if (validation.errors.title) {
        Validator.showFieldError(this.dom.expenseTitleInput, this.dom.titleError, validation.errors.title);
      }
      if (validation.errors.amount) {
        Validator.showFieldError(this.dom.expenseAmountInput, this.dom.amountError, validation.errors.amount);
      }
      if (validation.errors.date) {
        Validator.showFieldError(this.dom.expenseDateInput, this.dom.dateError, validation.errors.date);
      }
      if (validation.errors.category) {
        Validator.showFieldError(this.dom.expenseCategorySelect, this.dom.categoryError, validation.errors.category);
      }
      return;
    }

    if (this.isEditing) {
      const id = this.dom.expenseIdInput.value;
      const updated = this.store.updateExpense(id, validation.cleanData);
      if (updated) {
        this.showToast('Expense updated successfully!', 'success');
      }
    } else {
      this.store.addExpense(validation.cleanData);
      this.showToast('Expense added successfully!', 'success');
      
      // Trigger confetti if adding positive transaction and under budget
      const calc = this.store.getCalculations(this.currentMonth);
      if (calc.rawBudgetPercentage < 80 && window.confetti) {
        window.confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      }
    }

    this.closeExpenseModal();
    this.render();
  }

  // --- Budget Modal Handlers ---

  openBudgetModal() {
    this.dom.monthlyBudgetInput.value = this.store.monthlyBudget;
    Validator.clearFieldError(this.dom.monthlyBudgetInput, this.dom.budgetError);
    this.dom.budgetModal.classList.remove('hidden');
    setTimeout(() => this.dom.monthlyBudgetInput.focus(), 50);
  }

  closeBudgetModal() {
    this.dom.budgetModal.classList.add('hidden');
  }

  handleBudgetSubmit(e) {
    e.preventDefault();
    const val = this.dom.monthlyBudgetInput.value;
    const res = Validator.validateBudget(val);

    if (!res.isValid) {
      Validator.showFieldError(this.dom.monthlyBudgetInput, this.dom.budgetError, res.error);
      return;
    }

    this.store.saveBudget(res.value);
    this.closeBudgetModal();
    this.render();
    this.showToast(`Monthly budget set to ${this.store.formatAmount(res.value)}`, 'success');
  }

  // --- Delete Modal Handlers ---

  openDeleteModal(id) {
    const item = this.store.getExpenseById(id);
    if (!item) return;

    this.pendingDeleteId = id;
    this.dom.deleteModalTitle.textContent = 'Delete Transaction?';
    this.dom.deleteModalDesc.textContent = `Are you sure you want to delete "${item.title}" (${this.store.formatAmount(item.amount)})? This action cannot be undone.`;
    this.dom.deleteModal.classList.remove('hidden');
  }

  closeDeleteModal() {
    this.pendingDeleteId = null;
    this.dom.deleteModal.classList.add('hidden');
  }

  handleDeleteConfirm() {
    if (!this.pendingDeleteId) return;

    if (this.pendingDeleteId === '__ALL__') {
      this.store.clearAllExpenses();
      this.showToast('All expense records cleared.', 'warning');
    } else {
      const deleted = this.store.deleteExpense(this.pendingDeleteId);
      if (deleted) {
        this.showToast('Expense removed successfully.', 'info');
      }
    }

    this.closeDeleteModal();
    this.render();
  }

  // --- Data Export & Import Handlers ---

  openDataModal() {
    this.dom.dataModal.classList.remove('hidden');
  }

  closeDataModal() {
    this.dom.dataModal.classList.add('hidden');
  }

  handleExportCsv() {
    const csvContent = this.store.exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SpendCraft_Expenses_${formatDateLocal(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Expenses exported to CSV!', 'success');
  }

  handleExportJson() {
    const jsonContent = this.store.exportToJSON();
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SpendCraft_Backup_${formatDateLocal(new Date())}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Expenses exported to JSON!', 'success');
  }

  handleImportJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = this.store.importFromJSON(content);
      if (res.success) {
        this.render();
        this.closeDataModal();
        this.showToast(`Imported ${res.count} expenses successfully!`, 'success');
      } else {
        alert('Failed to import JSON: ' + res.error);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  // --- Toast System ---

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-600 text-white',
      warning: 'bg-amber-600 text-white',
      error: 'bg-rose-600 text-white',
      info: 'bg-slate-900 dark:bg-slate-800 text-white border border-slate-700'
    };

    const icons = {
      success: 'fa-circle-check',
      warning: 'fa-triangle-exclamation',
      error: 'fa-circle-xmark',
      info: 'fa-circle-info'
    };

    toast.className = `toast-item animate-pop-in flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.info}"></i>
      <span>${this.escapeHtml(message)}</span>
    `;

    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
