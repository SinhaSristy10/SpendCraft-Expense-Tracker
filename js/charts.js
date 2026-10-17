/**
 * Expense Tracker - Chart Visualizations Engine
 * Uses Chart.js to render interactive Monthly Trends & Category Breakdown charts.
 */

import { CATEGORIES } from './data.js';

export class ChartManager {
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

  /**
   * Initializes both charts
   */
  initCharts() {
    this.renderTrendsChart();
    this.renderCategoryChart();
  }

  /**
   * Renders or updates the Monthly Trends Bar/Line Chart
   */
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
            usePointStyle: true,
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
            grid: {
              display: false,
              color: theme.gridColor
            },
            ticks: {
              color: theme.textColor,
              font: { family: "'Inter', sans-serif", size: 12, weight: '500' }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: theme.gridColor,
              drawBorder: false
            },
            ticks: {
              color: theme.textColor,
              font: { family: "'Inter', sans-serif", size: 11 },
              callback: (value) => `${cur.symbol}${value}`
            }
          }
        }
      }
    });
  }

  /**
   * Renders or updates the Category Breakdown Doughnut Chart
   */
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
              font: { family: "'Inter', sans-serif", size: 11 },
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

  /**
   * Refreshes chart styles when theme changes (Light <-> Dark)
   */
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

  /**
   * Completely refreshes all chart data and re-renders
   */
  updateAll(selectedMonth = null) {
    this.renderTrendsChart();
    this.renderCategoryChart(selectedMonth);
  }
}
