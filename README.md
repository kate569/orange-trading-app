# 🍊 OJ TERMINAL 2.0

[![Live Demo](https://img.shields.io/badge/Live-Demo-orange?style=for-the-badge&logo=github)](https://kate569.github.io/orange-trading-app/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## About

**OJ TERMINAL 2.0** is a professional-grade, mock institutional trading terminal designed for analyzing **Orange Juice Futures (OJ=F)**. Built to simulate real-world commodity trading environments, the terminal integrates live market data, weather intelligence, and algorithmic analysis to generate actionable trading signals.

This system tracks the critical factors that drive OJ futures prices: **frost events** in Florida citrus groves, **inventory levels**, **technical indicators (RSI)**, **La Niña weather patterns**, and **Brazil supply disruptions**. Designed for traders, analysts, and researchers studying agricultural commodity markets.

---

## 📈 Key Features

### Market Intelligence
- **Real-Time Weather Tracking** — Live temperature, humidity, and wind data from Winter Haven, FL (citrus heartland) via Open-Meteo API
- **Frost Clock** — Persistent timer tracking exposure below 28°F (critical citrus damage threshold)
- **Live RSI Indicator** — 14-day Relative Strength Index calculated from Yahoo Finance historical price data
- **Inventory Monitoring** — Orange juice storage levels with supply/demand analysis

### Algorithmic Analysis
- **Algo Analyst** — AI-powered strategic analysis combining technical setup, fundamental drivers, and market verdicts
- **Multi-Factor Signal Calculator** — Evaluates 7+ variables: frost duration, temperature, inventory, RSI, La Niña, hurricanes, and Brazil drought
- **Trade Blueprint Generator** — Professional trade memos with position sizing, win probability, stop-loss/take-profit calculations

### Market Context Controls
- **La Niña Toggle** — Tracks ONI (Oceanic Niño Index) conditions that increase frost risk
- **Hurricane Warnings** — Manual toggle for NHC/NOAA hurricane alerts with proximity logic
- **Brazil Rainfall Index** — SPI-3 (Standardized Precipitation Index) for monitoring supply disruptions

### Information Streams
- **RSS News Feed** — Live Google News headlines filtered for orange juice commodity news (last 30 days)
- **Strategy Summary Table** — Historical win rates for 5 core trading strategies (La Niña Double Hit, Real Frost Event, Hurricane False Alarm, etc.)

### Enterprise Features
- **Physical Damage Alert System** — Modal popup when frost exposure exceeds 4 hours
- **Data Persistence** — LocalStorage integration for frost timers, market data, and RSI values
- **Stale Data Detection** — Auto-alerts when market sync is >30 minutes old
- **One-Click Sync** — Pull fresh weather + RSI data with timestamp validation

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19.2.3 |
| **Language** | TypeScript 5.3.0 |
| **Styling** | Tailwind CSS 4.1.18 |
| **Charts** | Recharts (via internal components) |
| **Build Tool** | Vite 7.3.0 |
| **APIs** | Open-Meteo (Weather), Yahoo Finance (RSI), Google News (RSS) |
| **Deployment** | GitHub Pages |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm installed
- Modern browser (Chrome, Firefox, Edge, Safari)

### Local Development

```bash
# Clone the repository
git clone https://github.com/kate569/orange-trading-app.git
cd orange-trading-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The terminal will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to GitHub Pages

```bash
# Deploy to gh-pages branch
npm run deploy
```

---

## 🎯 Usage

1. **Sync Live Data** — Click "Sync Live Data" to fetch current Winter Haven weather and OJ futures RSI
2. **Monitor Frost Clock** — Watch for automatic tracking when temperature drops below 28°F
3. **Configure Market Context** — Toggle La Niña status, hurricane warnings, and adjust inventory slider
4. **Analyze Signals** — Review the "Recommended Action" gauge and win probability meter
5. **Read Strategic Analysis** — Study the Algo Analyst's technical and fundamental breakdown
6. **Generate Trade Blueprint** — When frost exceeds 4 hours, click "Generate Trade Blueprint" for a printable memo
7. **Track News** — Scroll to bottom for live Google News headlines on OJ prices

---

## 📊 Trading Strategies

The system models 5 proven OJ futures strategies with historical win rates:

| Strategy | Win Rate | Key Catalyst |
|----------|----------|--------------|
| **Brazil Drought** | 82% | SPI-3 < -1.5 during Aug-Oct |
| **Real Frost Event** | 76% | 4+ hours below 28°F + low inventory |
| **La Niña Double Hit** | 68% | ONI < -0.5 + frost exposure |
| **Pre-Frost Volatility** | 62% | Temps 28-32°F + media coverage |
| **Hurricane False Alarm** | 58% | Hurricane >100mi from Polk County |

_Note: Historical performance does not guarantee future results._

---

## 🧪 Data Sources

- **Weather**: [Open-Meteo API](https://open-meteo.com) — Free, real-time meteorological data
- **RSI**: [Yahoo Finance](https://finance.yahoo.com) — Historical OJ=F closing prices for 14-day RSI
- **News**: [Google News RSS](https://news.google.com) — Filtered search for "orange juice prices" (30-day window)
- **Coordinates**: Winter Haven, FL (28.02°N, 81.73°W) — Geographic center of Florida citrus industry

---

## 📁 Project Structure

```
orange-trading-app/
├── src/
│   ├── components/
│   │   ├── PredictorDashboard.tsx    # Main terminal interface
│   │   ├── AnalystRationale.tsx      # Strategic analysis generator
│   │   └── NewsFeed.tsx              # RSS news reader
│   ├── services/
│   │   └── marketDataStream.ts       # API integrations (weather, RSI)
│   ├── calculateMarketSignal.browser.ts  # Signal generation logic
│   └── main.tsx                      # React app entry point
├── public/
│   └── favicon.svg                   # Orange icon
├── dist/                             # Production build output
├── vite.config.ts                    # Vite configuration
└── package.json                      # Dependencies
```

---

## 🔒 Disclaimer

**OJ TERMINAL 2.0** is a **demonstration project** for educational purposes. It is not financial advice. Do not use this system for actual commodity trading without proper risk management, broker consultation, and compliance review. Futures trading involves substantial risk of loss.

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **USDA NASS** — Inventory data methodology
- **National Hurricane Center** — Hurricane logic inspiration
- **CME Group** — OJ futures contract specifications
- **Open-Meteo** — Free weather API
- **Yahoo Finance** — Historical price data

---

**Built with ☕ for commodity traders and market enthusiasts.**

🔗 **[Launch Terminal →](https://kate569.github.io/orange-trading-app/)**

---

Last Deployment Check: Friday, December 26, 2025 at 7:45 PM EST
