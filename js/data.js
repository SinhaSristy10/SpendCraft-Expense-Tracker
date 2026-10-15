/**
 * Expense Tracker - Data Engine & Calculations
 * Handles storage, data schema, calculations, monthly totals, and exports.
 */

const STORAGE_KEYS = {
  EXPENSES: 'expense_tracker_expenses',
  BUDGET: 'expense_tracker_monthly_budget',
  CURRENCY: 'expense_tracker_currency',
  THEME: 'expense_tracker_theme'
};

// Available Categories with icons, color schemes, and budget guidelines
export const CATEGORIES = [
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

// Available Currencies with symbol and formatting
export const CURRENCIES = {
  USD: { symbol: '$', label: 'USD ($)', code: 'USD', locale: 'en-US' },
  INR: { symbol: '₹', label: 'INR (₹)', code: 'INR', locale: 'en-IN' },
  EUR: { symbol: '€', label: 'EUR (€)', code: 'EUR', locale: 'de-DE' },
  GBP: { symbol: '£', label: 'GBP (£)', code: 'GBP', locale: 'en-GB' },
  CAD: { symbol: 'CA$', label: 'CAD ($)', code: 'CAD', locale: 'en-CA' },
  AUD: { symbol: 'AU$', label: 'AUD ($)', code: 'AUD', locale: 'en-AU' },
  JPY: { symbol: '¥', label: 'JPY (¥)', code: 'JPY', locale: 'ja-JP' }
};

export const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'fa-credit-card' },
  { id: 'cash', name: 'Cash', icon: 'fa-money-bill-wave' },
  { id: 'upi', name: 'UPI / Online Transfer', icon: 'fa-mobile-screen-button' },
  { id: 'bank', name: 'Bank Transfer', icon: 'fa-building-columns' }
];

// Date formatting helper ensuring local calendar time (avoids UTC timezone shift issues)
export function formatDateLocal(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export class DataStore {
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

    // If initial run with no data, populate with demo data for immediate rich UX
    if (this.expenses.length === 0) {
      this.loadDemoData(false);
    }
  }

  // --- Persistence Handlers ---

  loadExpenses() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (stored) {
        this.expenses = JSON.parse(stored);
      } else {
        this.expenses = [];
      }
    } catch (e) {
      console.error('Error reading expenses from localStorage', e);
      this.expenses = [];
    }
  }

  saveExpenses() {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(this.expenses));
      return true;
    } catch (e) {
      console.error('Error writing expenses to localStorage', e);
      return false;
    }
  }

  loadBudget() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (stored) {
        this.monthlyBudget = parseFloat(stored) || 2500;
      }
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

  // --- CRUD Operations ---

  addExpense(expenseData) {
    const newExpense = {
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      title: expenseData.title.trim(),
      amount: parseFloat(expenseData.amount),
      category: expenseData.category,
      date: expenseData.date, // YYYY-MM-DD
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
    if (deleted) {
      this.saveExpenses();
    }
    return deleted;
  }

  getExpenseById(id) {
    return this.expenses.find(e => e.id === id) || null;
  }

  clearAllExpenses() {
    this.expenses = [];
    this.saveExpenses();
  }

  // --- Calculations & Analytics ---

  /**
   * Calculates grand total and monthly metrics.
   * @param {string|null} selectedMonth - Format 'YYYY-MM' or null for current month
   */
  getCalculations(selectedMonth = null) {
    const today = new Date();
    const currentMonthKey = selectedMonth || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Previous month key for comparison
    const [yearNum, monthNum] = currentMonthKey.split('-').map(Number);
    const prevDate = new Date(yearNum, monthNum - 2, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const totalAllTime = this.expenses.reduce((sum, item) => sum + item.amount, 0);

    // Current month expenses
    const currentMonthExpenses = this.expenses.filter(item => item.date.startsWith(currentMonthKey));
    const currentMonthTotal = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

    // Previous month expenses
    const prevMonthExpenses = this.expenses.filter(item => item.date.startsWith(prevMonthKey));
    const prevMonthTotal = prevMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

    // Month-over-Month percentage change
    let momChangePercent = 0;
    if (prevMonthTotal > 0) {
      momChangePercent = ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      momChangePercent = 100;
    }

    // Today's total using local date string
    const todayStr = formatDateLocal(today);
    const todayTotal = this.expenses
      .filter(item => item.date === todayStr)
      .reduce((sum, item) => sum + item.amount, 0);

    // Average daily expense in selected month
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    // If current active calendar month, divide by current day of month
    let divisorDays = daysInMonth;
    if (currentMonthKey === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`) {
      divisorDays = Math.max(1, today.getDate());
    }
    const dailyAverage = currentMonthTotal / divisorDays;

    // Highest single expense this month
    const highestExpense = currentMonthExpenses.reduce(
      (max, item) => (item.amount > (max ? max.amount : 0) ? item : max),
      null
    );

    // Budget progress
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

  /**
   * Returns category breakdown for chosen month (or all time)
   */
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

    // Convert to sorted array (highest total first)
    return Object.values(categoryMap)
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }

  /**
   * Returns last N months spending data for trends chart
   */
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

  /**
   * Filters and sorts expense records
   */
  getFilteredExpenses({ search = '', category = 'all', month = 'all', sortBy = 'date_desc' } = {}) {
    let result = [...this.expenses];

    // Filter by text search
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

    // Filter by category
    if (category && category !== 'all') {
      result = result.filter(item => item.category === category);
    }

    // Filter by month
    if (month && month !== 'all') {
      result = result.filter(item => item.date.startsWith(month));
    }

    // Sort
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

  // --- Export and Import ---

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

      // Validate imported items
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

  // --- Sample Demo Data Generator ---

  loadDemoData(overwrite = true) {
    const today = new Date();
    const currYear = today.getFullYear();
    const currMonth = today.getMonth(); // 0-indexed

    // Format helper using local calendar date
    const getDateStr = (monthsAgo, day) => {
      const d = new Date(currYear, currMonth - monthsAgo, day);
      return formatDateLocal(d);
    };

    const demoExpenses = [
      // Current Month
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
        notes: 'October residential rent transfer',
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
        notes: 'Celebration dinner with team',
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
        notes: 'Full-stack system design course',
        createdAt: new Date().toISOString()
      },

      // 1 Month Ago
      {
        id: 'exp_demo_9',
        title: 'Apartment Rent',
        amount: 950.00,
        category: 'housing',
        date: getDateStr(1, 1),
        paymentMethod: 'bank',
        notes: 'September residential rent',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp_demo_10',
        title: 'Supermarket Groceries',
        amount: 320.40,
        category: 'groceries',
        date: getDateStr(1, 15),
        paymentMethod: 'card',
        notes: 'Monthly bulk food supply',
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
        notes: 'Nike marathon shoes',
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
      },

      // 2 Months Ago
      {
        id: 'exp_demo_14',
        title: 'Apartment Rent',
        amount: 950.00,
        category: 'housing',
        date: getDateStr(2, 1),
        paymentMethod: 'bank',
        notes: 'August rent',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp_demo_15',
        title: 'Flight Ticket',
        amount: 340.00,
        category: 'travel',
        date: getDateStr(2, 10),
        paymentMethod: 'card',
        notes: 'Roundtrip family visit',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp_demo_16',
        title: 'Family Dinner at Trattoria',
        amount: 165.80,
        category: 'food',
        date: getDateStr(2, 18),
        paymentMethod: 'card',
        notes: 'Italian dinner celebration',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp_demo_17',
        title: 'Streaming Services (Netflix & Spotify)',
        amount: 28.98,
        category: 'entertainment',
        date: getDateStr(2, 5),
        paymentMethod: 'card',
        notes: 'Monthly digital subscriptions',
        createdAt: new Date().toISOString()
      }
    ];

    if (overwrite || this.expenses.length === 0) {
      this.expenses = demoExpenses;
      this.saveExpenses();
    }
  }
}
