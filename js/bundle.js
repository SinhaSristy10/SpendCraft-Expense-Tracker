/**
 * Expense Tracker - Standalone Bundle
 * Allows zero-dependency direct double-click opening via file:// protocol without ES module CORS restrictions.
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    EXPENSES: 'expense_tracker_expenses',
    BUDGET: 'expense_tracker_monthly_budget',
    CURRENCY: 'expense_tracker_currency',
    THEME: 'expense_tracker_theme'
  };

  const CATEGORIES = [
    { id: 'food', name: 'Food & Dining', icon: 'fa-utensils', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
    { id: 'groceries', name: 'Groceries', icon: 'fa-basket-shopping', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    { id: 'housing', name: 'Housing & Rent', icon: 'fa-house', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
    { id: 'transport', name: 'Transportation', icon: 'fa-car', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    { id: 'utilities', name: 'Bills & Utilities', icon: 'fa-bolt', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' },
    { id: 'entertainment', name: 'Entertainment', icon: 'fa-film', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
    { id: 'shopping', name: 'Shopping', icon: 'fa-bag-shopping', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
    { id: 'health', name: 'Health & Medical', icon: 'fa-heart-pulse', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
    { id: 'education', name: 'Education', icon: 'fa-graduation-cap', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
    { id: 'travel', name: 'Travel & Vacation', icon: 'fa-plane-departure', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' },
    { id: 'misc', name: 'Miscellaneous', icon: 'fa-tags', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' }
  ];

  const CURRENCIES = {
    USD: { symbol: '$', label: 'USD ($)', code: 'USD', locale: 'en-US' },
    INR: { symbol: '₹', label: 'INR (₹)', code: 'INR', locale: 'en-IN' },
    EUR: { symbol: '€', label: 'EUR (€)', code: 'EUR', locale: 'de-DE' },
    GBP: { symbol: '£', label: 'GBP (£)', code: 'GBP', locale: 'en-GB' },
    CAD: { symbol: 'CA$', label: 'CAD ($)', code: 'CAD', locale: 'en-CA' },
    AUD: { symbol: 'AU$', label: 'AUD ($)', code: 'AUD', locale: 'en-AU' },
    JPY: { symbol: '¥', label: 'JPY (¥)', code: 'JPY', locale: 'ja-JP' }
  };

  const PAYMENT_METHODS = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'fa-credit-card' },
    { id: 'cash', name: 'Cash', icon: 'fa-money-bill-wave' },
    { id: 'upi', name: 'UPI / Online Transfer', icon: 'fa-mobile-screen-button' },
    { id: 'bank', name: 'Bank Transfer', icon: 'fa-building-columns' }
  ];

  function formatDateLocal(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  class DataStore {
    constructor() {
      this.expenses = [];
      this.monthlyBudget = 2500;
      this.currentCurrency = 'USD';
      this.init();
    }

    init() {
      this.loadCurrency();
      this.loadBudget();
      this.loadExpenses();

      if (this.expenses.length === 0) {
        this.loadDemoData(false);
      }
    }

    loadExpenses() {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        this.expenses = stored ? JSON.parse(stored) : [];
      } catch (e) {
        this.expenses = [];
      }
    }

    saveExpenses() {
      try {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(this.expenses));
        return true;
      } catch (e) {
        return false;
      }
    }

    loadBudget() {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.BUDGET);
        this.monthlyBudget = stored ? parseFloat(stored) || 2500 : 2500;
      } catch (e) {
        this.monthlyBudget = 2500;
      }
    }

    saveBudget(amount) {
      this.monthlyBudget = Math.max(0, parseFloat(amount) || 0);
      localStorage.setItem(STORAGE_KEYS.BUDGET, this.monthlyBudget.toString());
    }

    loadCurrency() {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENCY);
        if (stored && CURRENCIES[stored]) {
          this.currentCurrency = stored;
        }
      } catch (e) {
        this.currentCurrency = 'USD';
      }
    }

    setCurrency(code) {
      if (CURRENCIES[code]) {
        this.currentCurrency = code;
        localStorage.setItem(STORAGE_KEYS.CURRENCY, code);
      }
    }

    getCurrencyInfo() {
      return CURRENCIES[this.currentCurrency] || CURRENCIES.USD;
    }

    formatAmount(val) {
      const num = parseFloat(val) || 0;
      const cur = this.getCurrencyInfo();
      return `${cur.symbol}${num.toLocaleString(cur.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    addExpense(expenseData) {
      const newExpense = {
        id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title: expenseData.title.trim(),
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        date: expenseData.date,
        paymentMethod: expenseData.paymentMethod || 'card',
        notes: (expenseData.notes || '').trim(),
        createdAt: new Date().toISOString()
      };

      this.expenses.unshift(newExpense);
      this.saveExpenses();
      return newExpense;
    }

    updateExpense(id, updatedData) {
      const index = this.expenses.findIndex(e => e.id === id);
      if (index === -1) return null;

      this.expenses[index] = {
        ...this.expenses[index],
        title: updatedData.title.trim(),
        amount: parseFloat(updatedData.amount),
        category: updatedData.category,
        date: updatedData.date,
        paymentMethod: updatedData.paymentMethod || 'card',
        notes: (updatedData.notes || '').trim(),
        updatedAt: new Date().toISOString()
      };

      this.saveExpenses();
      return this.expenses[index];
    }

    deleteExpense(id) {
      const initialLen = this.expenses.length;
      this.expenses = this.expenses.filter(e => e.id !== id);
      const deleted = this.expenses.length < initialLen;
      if (deleted) this.saveExpenses();
      return deleted;
    }

    getExpenseById(id) {
      return this.expenses.find(e => e.id === id) || null;
    }

    clearAllExpenses() {
      this.expenses = [];
      this.saveExpenses();
    }

    getCalculations(selectedMonth = null) {
      const today = new Date();
      const currentMonthKey = selectedMonth || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      const [yearNum, monthNum] = currentMonthKey.split('-').map(Number);
      const prevDate = new Date(yearNum, monthNum - 2, 1);
      const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

      const totalAllTime = this.expenses.reduce((sum, item) => sum + item.amount, 0);
      const currentMonthExpenses = this.expenses.filter(item => item.date.startsWith(currentMonthKey));
      const currentMonthTotal = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

      const prevMonthExpenses = this.expenses.filter(item => item.date.startsWith(prevMonthKey));
      const prevMonthTotal = prevMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

      let momChangePercent = 0;
      if (prevMonthTotal > 0) {
        momChangePercent = ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
      } else if (currentMonthTotal > 0) {
        momChangePercent = 100;
      }

      const todayStr = formatDateLocal(today);
      const todayTotal = this.expenses
        .filter(item => item.date === todayStr)
        .reduce((sum, item) => sum + item.amount, 0);

      const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
      let divisorDays = daysInMonth;
      if (currentMonthKey === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`) {
        divisorDays = Math.max(1, today.getDate());
      }
      const dailyAverage = currentMonthTotal / divisorDays;

      const highestExpense = currentMonthExpenses.reduce(
        (max, item) => (item.amount > (max ? max.amount : 0) ? item : max),
        null
      );

      const budget = this.monthlyBudget;
      const budgetRemaining = Math.max(0, budget - currentMonthTotal);
      const budgetPercentage = budget > 0 ? (currentMonthTotal / budget) * 100 : 0;

      return {
        totalAllTime,
        currentMonthKey,
        currentMonthTotal,
        prevMonthTotal,
        momChangePercent,
        todayTotal,
        dailyAverage,
        highestExpense,
        budget,
        budgetRemaining,
        budgetPercentage: Math.min(100, budgetPercentage),
        rawBudgetPercentage: budgetPercentage,
        totalCount: this.expenses.length,
        currentMonthCount: currentMonthExpenses.length
      };
    }

    getCategoryBreakdown(selectedMonth = null) {
      const list = selectedMonth
        ? this.expenses.filter(item => item.date.startsWith(selectedMonth))
        : this.expenses;

      const total = list.reduce((sum, e) => sum + e.amount, 0);
      const categoryMap = {};

      CATEGORIES.forEach(cat => {
        categoryMap[cat.id] = {
          category: cat,
          total: 0,
          count: 0,
          percentage: 0
        };
      });

      list.forEach(item => {
        const catId = item.category in categoryMap ? item.category : 'misc';
        categoryMap[catId].total += item.amount;
        categoryMap[catId].count += 1;
      });

      if (total > 0) {
        Object.keys(categoryMap).forEach(key => {
          categoryMap[key].percentage = (categoryMap[key].total / total) * 100;
        });
      }

      return Object.values(categoryMap)
        .filter(item => item.total > 0)
        .sort((a, b) => b.total - a.total);
    }

    getMonthlyTrends(monthsCount = 6) {
      const trends = [];
      const now = new Date();

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleDateString('default', { month: 'short' });
        const year = d.getFullYear();

        const total = this.expenses
          .filter(item => item.date.startsWith(monthKey))
          .reduce((sum, item) => sum + item.amount, 0);

        trends.push({
          monthKey,
          label: `${monthName} ${year}`,
          monthShort: monthName,
          total
        });
      }

      return trends;
    }

    getFilteredExpenses({ search = '', category = 'all', month = 'all', sortBy = 'date_desc' } = {}) {
      let result = [...this.expenses];

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        result = result.filter(item => {
          const titleMatch = item.title.toLowerCase().includes(q);
          const notesMatch = item.notes && item.notes.toLowerCase().includes(q);
          const catObj = CATEGORIES.find(c => c.id === item.category);
          const catMatch = catObj && catObj.name.toLowerCase().includes(q);
          return titleMatch || notesMatch || catMatch;
        });
      }

      if (category && category !== 'all') {
        result = result.filter(item => item.category === category);
      }

      if (month && month !== 'all') {
        result = result.filter(item => item.date.startsWith(month));
      }

      result.sort((a, b) => {
        switch (sortBy) {
          case 'date_desc':
            return new Date(b.date) - new Date(a.date) || b.createdAt.localeCompare(a.createdAt);
          case 'date_asc':
            return new Date(a.date) - new Date(b.date) || a.createdAt.localeCompare(b.createdAt);
          case 'amount_desc':
            return b.amount - a.amount;
          case 'amount_asc':
            return a.amount - b.amount;
          case 'title_asc':
            return a.title.localeCompare(b.title);
          default:
            return new Date(b.date) - new Date(a.date);
        }
      });

      return result;
    }

    exportToCSV() {
      const headers = ['ID', 'Date', 'Title', 'Category', 'Amount', 'Payment Method', 'Notes'];
      const rows = this.expenses.map(item => {
        const cat = CATEGORIES.find(c => c.id === item.category)?.name || item.category;
        const pm = PAYMENT_METHODS.find(p => p.id === item.paymentMethod)?.name || item.paymentMethod;
        const cleanNotes = (item.notes || '').replace(/"/g, '""');
        const cleanTitle = item.title.replace(/"/g, '""');
        return [
          item.id,
          item.date,
          `"${cleanTitle}"`,
          `"${cat}"`,
          item.amount.toFixed(2),
          `"${pm}"`,
          `"${cleanNotes}"`
        ].join(',');
      });

      return [headers.join(','), ...rows].join('\r\n');
    }

    exportToJSON() {
      return JSON.stringify({
        version: '2.0',
        exportedAt: new Date().toISOString(),
        currency: this.currentCurrency,
        monthlyBudget: this.monthlyBudget,
        expenses: this.expenses
      }, null, 2);
    }

    importFromJSON(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (!Array.isArray(data.expenses)) {
          throw new Error('Invalid format: missing "expenses" array');
        }

        const validExpenses = data.expenses.filter(e => e.title && !isNaN(e.amount) && e.date);
        this.expenses = validExpenses;
        if (data.monthlyBudget) this.saveBudget(data.monthlyBudget);
        if (data.currency && CURRENCIES[data.currency]) this.setCurrency(data.currency);

        this.saveExpenses();
        return { success: true, count: validExpenses.length };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    loadDemoData(overwrite = true) {
      const today = new Date();
      const currYear = today.getFullYear();
      const currMonth = today.getMonth();

      const getDateStr = (monthsAgo, day) => {
        const d = new Date(currYear, currMonth - monthsAgo, day);
        return formatDateLocal(d);
      };

      const demoExpenses = [
        {
          id: 'exp_demo_1',
          title: 'Whole Foods Market',
          amount: 142.50,
          category: 'groceries',
          date: getDateStr(0, Math.min(today.getDate(), 14)),
          paymentMethod: 'card',
          notes: 'Weekly fresh organic groceries',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_2',
          title: 'Monthly Apartment Rent',
          amount: 950.00,
          category: 'housing',
          date: getDateStr(0, 1),
          paymentMethod: 'bank',
          notes: 'Residential rent transfer',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_3',
          title: 'High-speed Fiber Internet',
          amount: 65.00,
          category: 'utilities',
          date: getDateStr(0, 5),
          paymentMethod: 'card',
          notes: 'Monthly 1Gbps internet bill',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_4',
          title: 'Sushi Harbor Dinner',
          amount: 88.20,
          category: 'food',
          date: getDateStr(0, Math.min(today.getDate(), 10)),
          paymentMethod: 'card',
          notes: 'Dinner with team',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_5',
          title: 'Uber Rides & Metro Card',
          amount: 45.30,
          category: 'transport',
          date: getDateStr(0, Math.min(today.getDate(), 8)),
          paymentMethod: 'upi',
          notes: 'Commute across downtown',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_6',
          title: 'Cinema & Popcorn Night',
          amount: 34.00,
          category: 'entertainment',
          date: getDateStr(0, Math.min(today.getDate(), 12)),
          paymentMethod: 'card',
          notes: 'IMAX movie tickets',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_7',
          title: 'Pharmacy & Vitamins',
          amount: 48.75,
          category: 'health',
          date: getDateStr(0, 7),
          paymentMethod: 'card',
          notes: 'Daily vitamins and prescription refill',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_8',
          title: 'Online Tech Book & Course',
          amount: 59.99,
          category: 'education',
          date: getDateStr(0, 4),
          paymentMethod: 'card',
          notes: 'Full-stack course subscription',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_9',
          title: 'Apartment Rent',
          amount: 950.00,
          category: 'housing',
          date: getDateStr(1, 1),
          paymentMethod: 'bank',
          notes: 'Previous month rent',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_10',
          title: 'Supermarket Groceries',
          amount: 320.40,
          category: 'groceries',
          date: getDateStr(1, 15),
          paymentMethod: 'card',
          notes: 'Bulk food supply',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_11',
          title: 'Weekend Getaway Airbnb',
          amount: 280.00,
          category: 'travel',
          date: getDateStr(1, 20),
          paymentMethod: 'card',
          notes: 'Mountain cabin stay',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_12',
          title: 'New Running Shoes',
          amount: 119.50,
          category: 'shopping',
          date: getDateStr(1, 24),
          paymentMethod: 'card',
          notes: 'Running marathon shoes',
          createdAt: new Date().toISOString()
        },
        {
          id: 'exp_demo_13',
          title: 'Electricity & Water Bill',
          amount: 110.25,
          category: 'utilities',
          date: getDateStr(1, 12),
          paymentMethod: 'upi',
          notes: 'Utility bill payment',
          createdAt: new Date().toISOString()
        }
      ];

      if (overwrite || this.expenses.length === 0) {
        this.expenses = demoExpenses;
        this.saveExpenses();
      }
    }
  }

  class Validator {
    static sanitizeString(input) {
      if (typeof input !== 'string') return '';
      return input.trim().replace(/[<>]/g, '');
    }

    static validateTitle(title) {
      const clean = (title || '').trim();
      if (!clean) return { isValid: false, error: 'Expense description is required.' };
      if (clean.length < 2) return { isValid: false, error: 'Description must be at least 2 characters.' };
      if (clean.length > 80) return { isValid: false, error: 'Description cannot exceed 80 characters.' };
      return { isValid: true, error: null };
    }

    static validateAmount(amount) {
      if (amount === undefined || amount === null || amount === '') {
        return { isValid: false, error: 'Amount is required.', value: 0 };
      }
      const num = parseFloat(amount);
      if (isNaN(num)) return { isValid: false, error: 'Amount must be a valid number.', value: 0 };
      if (num <= 0) return { isValid: false, error: 'Amount must be greater than 0.00.', value: 0 };
      if (num > 100000000) return { isValid: false, error: 'Amount exceeds maximum allowable threshold.', value: 0 };

      const strVal = amount.toString();
      if (strVal.includes('.')) {
        const decimals = strVal.split('.')[1];
        if (decimals && decimals.length > 2) {
          return { isValid: false, error: 'Amount cannot have more than 2 decimal places.', value: 0 };
        }
      }
      return { isValid: true, error: null, value: Math.round(num * 100) / 100 };
    }

    static validateCategory(category) {
      if (!category) return { isValid: false, error: 'Please select a category.' };
      const validCategoryIds = CATEGORIES.map(c => c.id);
      if (!validCategoryIds.includes(category)) return { isValid: false, error: 'Invalid category selected.' };
      return { isValid: true, error: null };
    }

    static validateDate(dateStr) {
      if (!dateStr || dateStr.trim() === '') return { isValid: false, error: 'Transaction date is required.' };
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(dateStr)) return { isValid: false, error: 'Date must be in YYYY-MM-DD format.' };

      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
        return { isValid: false, error: 'Invalid calendar date provided.' };
      }
      return { isValid: true, error: null };
    }

    static validateBudget(budget) {
      if (budget === undefined || budget === null || budget === '') {
        return { isValid: false, error: 'Budget amount is required.', value: 0 };
      }
      const num = parseFloat(budget);
      if (isNaN(num) || num < 0) return { isValid: false, error: 'Budget must be a positive number or zero.', value: 0 };
      return { isValid: true, error: null, value: Math.round(num * 100) / 100 };
    }

    static validateExpenseForm(data) {
      const errors = {};
      const titleRes = this.validateTitle(data.title);
      if (!titleRes.isValid) errors.title = titleRes.error;

      const amountRes = this.validateAmount(data.amount);
      if (!amountRes.isValid) errors.amount = amountRes.error;

      const categoryRes = this.validateCategory(data.category);
      if (!categoryRes.isValid) errors.category = categoryRes.error;

      const dateRes = this.validateDate(data.date);
      if (!dateRes.isValid) errors.date = dateRes.error;

      const isValid = Object.keys(errors).length === 0;
      return {
        isValid,
        errors,
        cleanData: {
          title: this.sanitizeString(data.title),
          amount: amountRes.value,
          category: data.category,
          date: data.date,
          paymentMethod: data.paymentMethod || 'card',
          notes: this.sanitizeString(data.notes || '')
        }
      };
    }

    static showFieldError(inputElement, errorElement, errorMessage) {
      if (!inputElement || !errorElement) return;
      inputElement.classList.add('border-rose-500', 'focus:ring-rose-500', 'bg-rose-50/20');
      inputElement.classList.remove('border-slate-200', 'border-slate-700', 'focus:ring-indigo-500');
      errorElement.textContent = errorMessage;
      errorElement.classList.remove('hidden');
    }

    static clearFieldError(inputElement, errorElement) {
      if (!inputElement || !errorElement) return;
      inputElement.classList.remove('border-rose-500', 'focus:ring-rose-500', 'bg-rose-50/20');
      inputElement.classList.add('border-slate-200', 'dark:border-slate-700');
      errorElement.textContent = '';
      errorElement.classList.add('hidden');
    }
  }

  class ChartManager {
    constructor(dataStore) {
      this.dataStore = dataStore;
      this.trendsChart = null;
      this.categoryChart = null;
    }

    isDarkMode() {
      return document.documentElement.classList.contains('dark');
    }

    getThemeColors() {
      const isDark = this.isDarkMode();
      return {
        textColor: isDark ? '#94a3b8' : '#64748b',
        gridColor: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)',
        tooltipBg: isDark ? '#0f172a' : '#1e293b',
        tooltipText: '#f8fafc',
        tooltipBorder: isDark ? '#334155' : '#475569'
      };
    }

    initCharts() {
      this.renderTrendsChart();
      this.renderCategoryChart();
    }

    renderTrendsChart() {
      const ctx = document.getElementById('trendsChart');
      if (!ctx || !window.Chart) return;

      const trends = this.dataStore.getMonthlyTrends(6);
      const theme = this.getThemeColors();
      const cur = this.dataStore.getCurrencyInfo();

      const labels = trends.map(t => t.label);
      const dataValues = trends.map(t => t.total);

      if (this.trendsChart) {
        this.trendsChart.data.labels = labels;
        this.trendsChart.data.datasets[0].data = dataValues;
        this.trendsChart.options.scales.x.ticks.color = theme.textColor;
        this.trendsChart.options.scales.y.ticks.color = theme.textColor;
        this.trendsChart.options.scales.x.grid.color = theme.gridColor;
        this.trendsChart.options.scales.y.grid.color = theme.gridColor;
        this.trendsChart.update();
        return;
      }

      this.trendsChart = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Expenses',
            data: dataValues,
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return '#6366f1';
              const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
              gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
              gradient.addColorStop(1, 'rgba(99, 102, 241, 0.85)');
              return gradient;
            },
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 44
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: theme.tooltipBg,
              titleColor: theme.tooltipText,
              bodyColor: theme.tooltipText,
              borderColor: theme.tooltipBorder,
              borderWidth: 1,
              padding: 12,
              boxPadding: 6,
              callbacks: {
                label: (context) => {
                  const val = context.parsed.y || 0;
                  return ` Spent: ${cur.symbol}${val.toLocaleString(cur.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false, color: theme.gridColor },
              ticks: { color: theme.textColor, font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '500' } }
            },
            y: {
              beginAtZero: true,
              grid: { color: theme.gridColor, drawBorder: false },
              ticks: {
                color: theme.textColor,
                font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                callback: (value) => `${cur.symbol}${value}`
              }
            }
          }
        }
      });
    }

    renderCategoryChart(selectedMonth = null) {
      const ctx = document.getElementById('categoryChart');
      const emptyState = document.getElementById('categoryEmptyState');
      if (!ctx || !window.Chart) return;

      const breakdown = this.dataStore.getCategoryBreakdown(selectedMonth);
      const theme = this.getThemeColors();
      const cur = this.dataStore.getCurrencyInfo();

      if (breakdown.length === 0) {
        if (this.categoryChart) {
          this.categoryChart.destroy();
          this.categoryChart = null;
        }
        ctx.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      }

      ctx.classList.remove('hidden');
      if (emptyState) emptyState.classList.add('hidden');

      const labels = breakdown.map(item => item.category.name);
      const dataValues = breakdown.map(item => item.total);
      const bgColors = breakdown.map(item => item.category.color);

      if (this.categoryChart) {
        this.categoryChart.data.labels = labels;
        this.categoryChart.data.datasets[0].data = dataValues;
        this.categoryChart.data.datasets[0].backgroundColor = bgColors;
        this.categoryChart.options.plugins.legend.labels.color = theme.textColor;
        this.categoryChart.update();
        return;
      }

      this.categoryChart = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: bgColors,
            borderColor: this.isDarkMode() ? '#1e293b' : '#ffffff',
            borderWidth: 3,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: theme.textColor,
                font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                padding: 12,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: theme.tooltipBg,
              titleColor: theme.tooltipText,
              bodyColor: theme.tooltipText,
              borderColor: theme.tooltipBorder,
              borderWidth: 1,
              padding: 12,
              boxPadding: 6,
              callbacks: {
                label: (context) => {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const val = context.parsed || 0;
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                  return ` ${cur.symbol}${val.toLocaleString(cur.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }

    updateTheme() {
      const theme = this.getThemeColors();
      if (this.trendsChart) {
        this.trendsChart.options.scales.x.ticks.color = theme.textColor;
        this.trendsChart.options.scales.y.ticks.color = theme.textColor;
        this.trendsChart.options.scales.y.grid.color = theme.gridColor;
        this.trendsChart.update();
      }
      if (this.categoryChart) {
        this.categoryChart.data.datasets[0].borderColor = this.isDarkMode() ? '#1e293b' : '#ffffff';
        if (this.categoryChart.options.plugins.legend) {
          this.categoryChart.options.plugins.legend.labels.color = theme.textColor;
        }
        this.categoryChart.update();
      }
    }

    updateAll(selectedMonth = null) {
      this.renderTrendsChart();
      this.renderCategoryChart(selectedMonth);
    }
  }

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

        kpiMonthTotal: document.getElementById('kpiMonthTotal'),
        kpiMomBadge: document.getElementById('kpiMomBadge'),
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

        searchInput: document.getElementById('searchInput'),
        clearSearchBtn: document.getElementById('clearSearchBtn'),
        categoryFilter: document.getElementById('categoryFilter'),
        sortOrder: document.getElementById('sortOrder'),
        clearAllBtn: document.getElementById('clearAllBtn'),
        resultsCount: document.getElementById('resultsCount'),
        filteredTotalSum: document.getElementById('filteredTotalSum'),

        expenseTableBody: document.getElementById('expenseTableBody'),
        tableEmptyState: document.getElementById('tableEmptyState'),
        emptyStateAddBtn: document.getElementById('emptyStateAddBtn'),

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

        budgetModal: document.getElementById('budgetModal'),
        budgetModalBackdrop: document.getElementById('budgetModalBackdrop'),
        closeBudgetModalBtn: document.getElementById('closeBudgetModalBtn'),
        cancelBudgetModalBtn: document.getElementById('cancelBudgetModalBtn'),
        budgetForm: document.getElementById('budgetForm'),
        monthlyBudgetInput: document.getElementById('monthlyBudgetInput'),
        budgetError: document.getElementById('budgetError'),

        deleteModal: document.getElementById('deleteModal'),
        deleteModalBackdrop: document.getElementById('deleteModalBackdrop'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
        deleteModalTitle: document.getElementById('deleteModalTitle'),
        deleteModalDesc: document.getElementById('deleteModalDesc'),

        dataModal: document.getElementById('dataModal'),
        dataModalBackdrop: document.getElementById('dataModalBackdrop'),
        closeDataModalBtn: document.getElementById('closeDataModalBtn'),
        exportCsvBtn: document.getElementById('exportCsvBtn'),
        exportJsonBtn: document.getElementById('exportJsonBtn'),
        importFileInput: document.getElementById('importFileInput'),

        toastContainer: document.getElementById('toastContainer')
      };
    }

    initCategoryDropdowns() {
      this.dom.expenseCategorySelect.innerHTML = '<option value="">-- Choose Category --</option>';
      this.dom.categoryFilter.innerHTML = '<option value="all">All Categories</option>';

      CATEGORIES.forEach(cat => {
        const formOpt = document.createElement('option');
        formOpt.value = cat.id;
        formOpt.textContent = cat.name;
        this.dom.expenseCategorySelect.appendChild(formOpt);

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

    bindEvents() {
      this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

      this.dom.currencySelect.addEventListener('change', (e) => {
        this.store.setCurrency(e.target.value);
        this.updateCurrencyLabels();
        this.render();
        this.showToast(`Currency changed to ${e.target.value}`, 'info');
      });

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

      this.dom.openAddModalBtn.addEventListener('click', () => this.openExpenseModal());
      this.dom.emptyStateAddBtn.addEventListener('click', () => this.openExpenseModal());
      this.dom.closeExpenseModalBtn.addEventListener('click', () => this.closeExpenseModal());
      this.dom.cancelExpenseModalBtn.addEventListener('click', () => this.closeExpenseModal());
      this.dom.expenseModalBackdrop.addEventListener('click', () => this.closeExpenseModal());

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

      this.dom.expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));

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

      this.dom.setBudgetBtn.addEventListener('click', () => this.openBudgetModal());
      this.dom.closeBudgetModalBtn.addEventListener('click', () => this.closeBudgetModal());
      this.dom.cancelBudgetModalBtn.addEventListener('click', () => this.closeBudgetModal());
      this.dom.budgetModalBackdrop.addEventListener('click', () => this.closeBudgetModal());
      this.dom.budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));

      document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.dom.monthlyBudgetInput.value = e.currentTarget.dataset.preset;
        });
      });

      this.dom.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
      this.dom.deleteModalBackdrop.addEventListener('click', () => this.closeDeleteModal());
      this.dom.confirmDeleteBtn.addEventListener('click', () => this.handleDeleteConfirm());

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

      this.dom.resetDemoBtn.addEventListener('click', () => {
        this.store.loadDemoData(true);
        this.render();
        this.showToast('Sample demo transactions loaded successfully!', 'success');
      });

      this.dom.printBtn.addEventListener('click', () => {
        window.print();
      });

      this.dom.openDataModalBtn.addEventListener('click', () => this.openDataModal());
      this.dom.closeDataModalBtn.addEventListener('click', () => this.closeDataModal());
      this.dom.dataModalBackdrop.addEventListener('click', () => this.closeDataModal());

      this.dom.exportCsvBtn.addEventListener('click', () => this.handleExportCsv());
      this.dom.exportJsonBtn.addEventListener('click', () => this.handleExportJson());
      this.dom.importFileInput.addEventListener('change', (e) => this.handleImportJson(e));

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeExpenseModal();
          this.closeBudgetModal();
          this.closeDeleteModal();
          this.closeDataModal();
        }
      });
    }

    render() {
      this.renderKPIs();
      this.renderTable();
      this.charts.updateAll(this.currentMonth);
    }

    renderKPIs() {
      const calc = this.store.getCalculations(this.currentMonth);

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

      this.dom.kpiBudgetLimit.textContent = this.store.formatAmount(calc.budget);
      this.dom.kpiBudgetPctText.textContent = `${calc.rawBudgetPercentage.toFixed(0)}%`;
      this.dom.kpiBudgetProgressBar.style.width = `${calc.budgetPercentage}%`;

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

      this.dom.kpiTodayTotal.textContent = this.store.formatAmount(calc.todayTotal);
      this.dom.kpiDailyAvg.textContent = this.store.formatAmount(calc.dailyAverage);

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

        const calc = this.store.getCalculations(this.currentMonth);
        if (calc.rawBudgetPercentage < 80 && window.confetti) {
          window.confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
        }
      }

      this.closeExpenseModal();
      this.render();
    }

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

  // Auto-initialize when loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const app = new App();
      app.init();
    });
  } else {
    const app = new App();
    app.init();
  }

})();
