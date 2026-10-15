/**
 * Expense Tracker - Form Validation & Sanitization Engine
 * Provides comprehensive input validation, error messaging, and sanitization.
 */

import { CATEGORIES } from './data.js';

export class Validator {
  /**
   * Sanitizes string input to prevent XSS / formatting issues
   */
  static sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .replace(/[<>]/g, ''); // strip angle brackets
  }

  /**
   * Validates title / expense description
   * @param {string} title
   * @returns {{isValid: boolean, error: string|null}}
   */
  static validateTitle(title) {
    const clean = (title || '').trim();
    if (!clean) {
      return { isValid: false, error: 'Expense description is required.' };
    }
    if (clean.length < 2) {
      return { isValid: false, error: 'Description must be at least 2 characters.' };
    }
    if (clean.length > 80) {
      return { isValid: false, error: 'Description cannot exceed 80 characters.' };
    }
    return { isValid: true, error: null };
  }

  /**
   * Validates monetary amount
   * @param {number|string} amount
   * @returns {{isValid: boolean, error: string|null, value: number}}
   */
  static validateAmount(amount) {
    if (amount === undefined || amount === null || amount === '') {
      return { isValid: false, error: 'Amount is required.', value: 0 };
    }

    const num = parseFloat(amount);

    if (isNaN(num)) {
      return { isValid: false, error: 'Amount must be a valid number.', value: 0 };
    }

    if (num <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0.00.', value: 0 };
    }

    if (num > 100000000) {
      return { isValid: false, error: 'Amount exceeds maximum allowable threshold (100,000,000).', value: 0 };
    }

    // Check decimal precision (at most 2 decimals)
    const strVal = amount.toString();
    if (strVal.includes('.')) {
      const decimals = strVal.split('.')[1];
      if (decimals && decimals.length > 2) {
        return { isValid: false, error: 'Amount cannot have more than 2 decimal places.', value: 0 };
      }
    }

    return { isValid: true, error: null, value: Math.round(num * 100) / 100 };
  }

  /**
   * Validates Category
   * @param {string} category
   * @returns {{isValid: boolean, error: string|null}}
   */
  static validateCategory(category) {
    if (!category || category === '') {
      return { isValid: false, error: 'Please select a category.' };
    }

    const validCategoryIds = CATEGORIES.map(c => c.id);
    if (!validCategoryIds.includes(category)) {
      return { isValid: false, error: 'Invalid category selected.' };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validates Date (YYYY-MM-DD)
   * @param {string} dateStr
   * @returns {{isValid: boolean, error: string|null}}
   */
  static validateDate(dateStr) {
    if (!dateStr || dateStr.trim() === '') {
      return { isValid: false, error: 'Transaction date is required.' };
    }

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) {
      return { isValid: false, error: 'Date must be in YYYY-MM-DD format.' };
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);

    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      return { isValid: false, error: 'Invalid calendar date provided.' };
    }

    // Guard against unreasonable past (> 20 years) or far future (> 5 years)
    const currentYear = new Date().getFullYear();
    if (year < currentYear - 20) {
      return { isValid: false, error: 'Date cannot be more than 20 years in the past.' };
    }
    if (year > currentYear + 5) {
      return { isValid: false, error: 'Date cannot be more than 5 years in the future.' };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validates Monthly Budget input
   * @param {number|string} budget
   * @returns {{isValid: boolean, error: string|null, value: number}}
   */
  static validateBudget(budget) {
    if (budget === undefined || budget === null || budget === '') {
      return { isValid: false, error: 'Budget amount is required.', value: 0 };
    }

    const num = parseFloat(budget);

    if (isNaN(num) || num < 0) {
      return { isValid: false, error: 'Budget must be a positive number or zero.', value: 0 };
    }

    if (num > 100000000) {
      return { isValid: false, error: 'Budget exceeds maximum limit.', value: 0 };
    }

    return { isValid: true, error: null, value: Math.round(num * 100) / 100 };
  }

  /**
   * Validates complete expense payload
   * @param {Object} data
   * @returns {{isValid: boolean, errors: Object, cleanData: Object}}
   */
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

    const cleanData = {
      title: this.sanitizeString(data.title),
      amount: amountRes.value,
      category: data.category,
      date: data.date,
      paymentMethod: data.paymentMethod || 'card',
      notes: this.sanitizeString(data.notes || '')
    };

    return {
      isValid,
      errors,
      cleanData
    };
  }

  /**
   * Helper to attach inline visual validation error to DOM input
   */
  static showFieldError(inputElement, errorElement, errorMessage) {
    if (!inputElement || !errorElement) return;
    inputElement.classList.add('border-rose-500', 'focus:ring-rose-500', 'bg-rose-50/20');
    inputElement.classList.remove('border-slate-200', 'border-slate-700', 'focus:ring-indigo-500');
    errorElement.textContent = errorMessage;
    errorElement.classList.remove('hidden');
  }

  /**
   * Helper to clear visual validation error from DOM input
   */
  static clearFieldError(inputElement, errorElement) {
    if (!inputElement || !errorElement) return;
    inputElement.classList.remove('border-rose-500', 'focus:ring-rose-500', 'bg-rose-50/20');
    inputElement.classList.add('border-slate-200', 'dark:border-slate-700');
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
  }
}
