export { calculateMarketSignal, MarketSignalResult } from "./calculateMarketSignal";
export {
  calculateMarketSignalBrowser,
  MarketSignalResultWithInsight,
  SignalInsight,
  MarketContextParams,
  STRATEGY_WIN_RATES,
} from "./calculateMarketSignal.browser";
export { PredictorDashboard } from "./components/PredictorDashboard";
export {
  fetchLiveMarketData,
  formatSyncTime,
  LiveMarketData,
} from "./services/marketDataStream";
