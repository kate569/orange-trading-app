"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSyncTime = exports.fetchLiveMarketData = exports.PredictorDashboard = exports.STRATEGY_WIN_RATES = exports.calculateMarketSignalBrowser = exports.calculateMarketSignal = void 0;
var calculateMarketSignal_1 = require("./calculateMarketSignal");
Object.defineProperty(exports, "calculateMarketSignal", { enumerable: true, get: function () { return calculateMarketSignal_1.calculateMarketSignal; } });
var calculateMarketSignal_browser_1 = require("./calculateMarketSignal.browser");
Object.defineProperty(exports, "calculateMarketSignalBrowser", { enumerable: true, get: function () { return calculateMarketSignal_browser_1.calculateMarketSignalBrowser; } });
Object.defineProperty(exports, "STRATEGY_WIN_RATES", { enumerable: true, get: function () { return calculateMarketSignal_browser_1.STRATEGY_WIN_RATES; } });
var PredictorDashboard_1 = require("./components/PredictorDashboard");
Object.defineProperty(exports, "PredictorDashboard", { enumerable: true, get: function () { return PredictorDashboard_1.PredictorDashboard; } });
var marketDataStream_1 = require("./services/marketDataStream");
Object.defineProperty(exports, "fetchLiveMarketData", { enumerable: true, get: function () { return marketDataStream_1.fetchLiveMarketData; } });
Object.defineProperty(exports, "formatSyncTime", { enumerable: true, get: function () { return marketDataStream_1.formatSyncTime; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUVBQW9GO0FBQTNFLDhIQUFBLHFCQUFxQixPQUFBO0FBQzlCLGlGQU15QztBQUx2Qyw2SUFBQSw0QkFBNEIsT0FBQTtBQUk1QixtSUFBQSxrQkFBa0IsT0FBQTtBQUVwQixzRUFBcUU7QUFBNUQsd0hBQUEsa0JBQWtCLE9BQUE7QUFDM0IsZ0VBSXFDO0FBSG5DLHVIQUFBLG1CQUFtQixPQUFBO0FBQ25CLGtIQUFBLGNBQWMsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7IGNhbGN1bGF0ZU1hcmtldFNpZ25hbCwgTWFya2V0U2lnbmFsUmVzdWx0IH0gZnJvbSBcIi4vY2FsY3VsYXRlTWFya2V0U2lnbmFsXCI7XG5leHBvcnQge1xuICBjYWxjdWxhdGVNYXJrZXRTaWduYWxCcm93c2VyLFxuICBNYXJrZXRTaWduYWxSZXN1bHRXaXRoSW5zaWdodCxcbiAgU2lnbmFsSW5zaWdodCxcbiAgTWFya2V0Q29udGV4dFBhcmFtcyxcbiAgU1RSQVRFR1lfV0lOX1JBVEVTLFxufSBmcm9tIFwiLi9jYWxjdWxhdGVNYXJrZXRTaWduYWwuYnJvd3NlclwiO1xuZXhwb3J0IHsgUHJlZGljdG9yRGFzaGJvYXJkIH0gZnJvbSBcIi4vY29tcG9uZW50cy9QcmVkaWN0b3JEYXNoYm9hcmRcIjtcbmV4cG9ydCB7XG4gIGZldGNoTGl2ZU1hcmtldERhdGEsXG4gIGZvcm1hdFN5bmNUaW1lLFxuICBMaXZlTWFya2V0RGF0YSxcbn0gZnJvbSBcIi4vc2VydmljZXMvbWFya2V0RGF0YVN0cmVhbVwiO1xuIl19