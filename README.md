# 💳 SpendCraft - Smart Expense Tracker & Analytics Dashboard

A modern, high-performance personal finance and expense tracking web application. Designed with an ultra-clean glassmorphic UI, rich interactive charts, strict form validation, dynamic calculations, and zero-friction persistence.

![SpendCraft Dashboard Preview](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80)

---

## 🎯 Project Curriculum Alignment

| Concept | Implementation in SpendCraft |
| :--- | :--- |
| **What to Build** | Add expenses, categorized transactions, monthly totals, budget limits, trends |
| **What You Learn** | **Data handling**, **validation**, **calculations**, **CRUD operations**, **persistence**, **filtering & sorting** |

---

## ✨ Features & Highlights

### 1. 📊 Dynamic Financial Calculations
- **Monthly Spending Totals**: Calculates exact expenditure for any selected month.
- **Month-over-Month (MoM) Analytics**: Compares current month spending against previous month with percentage change (`+` or `-` trend badges).
- **Daily Average Calculation**: Dynamic daily burn-rate based on active days in the month.
- **Top Category Identification**: Detects which category consumes the highest proportion of income, with category percentage breakdowns.
- **Monthly Budget Engine**: Visual color-coded progress bar (Green `<80%` Safe, Amber `80%-99%` Warning, Red `≥100%` Over Budget) with real-time remaining balance.
- **Multi-Currency Support**: Switch between **USD ($)**, **INR (₹)**, **EUR (€)**, **GBP (£)**, **CAD ($)**, **AUD ($)**, and **JPY (¥)** on the fly.

### 2. 🛡️ Strict Form Validation & Sanitization
- **Required Fields Enforcement**: Description, Amount, Date, and Category are strictly verified before record creation.
- **Monetary Boundary Checks**: Protects against non-numeric inputs, negative figures, zero amounts, and limits decimal precision to 2 decimal places.
- **Date Constraints**: Restricts inputs to valid calendar dates within reasonable bounds.
- **XSS Sanitization**: Strips dangerous HTML tags and characters from user inputs before persisting.
- **Inline Error Feedback**: Real-time red highlight borders and descriptive warning messages beneath inputs, auto-cleared upon user correction.

### 3. 📈 Interactive Visual Analytics (Chart.js)
- **Monthly Trends Bar Chart**: Visualizes spending volume across the past 6 months with custom gradients and hover tooltips.
- **Category Doughnut Chart**: Interactive breakdown of expenditures by category with color-coded legends and exact percentage tooltips.
- **Theme Synchronization**: Charts dynamically re-theme their axes, grids, and borders when toggling Dark/Light mode.

### 4. ⚡ Data Handling, CRUD & Persistence
- **Create**: Add new expenses with title, amount, category, date, payment method, and optional notes.
- **Read**: View structured table with formatted currency, badges, payment icons, and relative dates.
- **Update**: Edit existing transactions via pre-filled modal window.
- **Delete**: Remove transactions with an animated confirmation modal preventing accidental data loss.
- **Full Search & Multi-Filters**: Instant text search across titles and notes; filter by category; filter by month/year; sort by newest, oldest, highest amount, lowest amount, or title.
- **Data Export & Backup**:
  - Export to **CSV** (for Excel, Google Sheets, Numbers)
  - Export to **JSON** (full data backup)
  - Import from **JSON** (restore from file)
- **One-Click Demo Data**: Instantly populates 15+ realistic expenses across 3 months to explore all charts and metrics immediately.

### 5. 🎨 Fantastic Modern UI / UX
- **Glassmorphism Design**: Sleek frosted glass cards with subtle borders and shadows.
- **Dark Mode / Light Mode**: Instant toggle saved in `localStorage`.
- **Celebration Confetti**: Delightful celebratory confetti when adding savings-conscious transactions!
- **Toast Notifications**: Smooth floating toasts for feedback on every action.
- **Printable Reports**: Built-in print stylesheet to print clean monthly summaries without headers or buttons.

---

## 📁 Project Architecture

```
Expense-Tracker/
├── index.html          # Semantic HTML5 dashboard layout & modal structures
├── run.bat             # One-click Windows desktop launcher
├── server.js           # Zero-dependency local Node.js static HTTP server
├── package.json        # NPM scripts and project metadata
├── README.md           # Full documentation
├── css/
│   └── styles.css      # Plus Jakarta Sans typography, glassmorphism, animations, print CSS
└── js/
    ├── app.js          # Main application orchestrator & event coordinator
    ├── data.js         # DataStore, calculation engine, categories, currencies, export/import
    ├── validation.js   # Validator engine, error handlers, input sanitization
    ├── charts.js       # Chart.js visualization manager with theme adaptation
    └── bundle.js       # Standalone bundle for direct file:// browser execution
```

---

## 🚀 How to Run the Project

You can run SpendCraft using **any** of the following simple methods:

### Method 1: One-Click Desktop Launcher (Recommended for Windows)
Simply double-click the **`run.bat`** file in the project folder. It will start the local server and automatically open the app in your default browser.

### Method 2: Node.js Terminal
Open PowerShell or Command Prompt in the project folder and run:
```bash
node server.js
```
Then open your browser at:
```
http://localhost:3000
```
*(Or run `npm start` if you prefer npm)*

### Method 3: Direct Browser Double-Click (Zero Setup)
Simply double-click **`index.html`** in File Explorer to open it in Chrome, Edge, Firefox, or Brave! The built-in dual-mode loader automatically detects the local file protocol and initializes the standalone bundle without CORS issues.

---

## 💡 Concepts Mastered
1. **State Management**: Managing application state, active filters, and synchronized chart models.
2. **Local Storage Persistence**: Serializing, deserializing, and handling edge cases with browser storage.
3. **Data Aggregations**: Reducers, category mapping, month-over-month comparisons, and statistical averages.
4. **Defensive Validation**: Form sanitization, regex date validation, boundary rules, and accessible UI error states.
5. **Modern Frontend Aesthetics**: Tailwind CSS utilities, CSS custom variables, backdrop filters, and micro-interactions.

---

*Crafted with precision for optimal learning and user delight.*
