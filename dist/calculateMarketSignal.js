"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMarketSignal = calculateMarketSignal;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Calculates market signal based on temperature, frost duration, and inventory levels.
 *
 * @param currentTemp - Current temperature in Fahrenheit
 * @param hoursBelow28 - Number of hours temperature has been below 28°F
 * @param currentInventory - Current inventory in millions (e.g., 30 for 30M)
 * @returns MarketSignalResult with win probability and recommended action
 */
function calculateMarketSignal(currentTemp, hoursBelow28, currentInventory) {
    // Read market rules from JSON file
    const rulesPath = path.resolve(__dirname, "../constants/market_rules.json");
    const rulesData = fs.readFileSync(rulesPath, "utf-8");
    const rules = JSON.parse(rulesData);
    const { frost_rule, inventory_multipliers, win_rates } = rules;
    // Determine base win probability based on frost conditions
    let baseWinProbability;
    const isBelowCriticalTemp = currentTemp < frost_rule.critical_temp_f;
    const hasSufficientDuration = hoursBelow28 >= frost_rule.min_duration_hours;
    if (isBelowCriticalTemp && hasSufficientDuration) {
        // Real frost conditions met
        baseWinProbability = win_rates.real_frost;
    }
    else if (isBelowCriticalTemp) {
        // Pre-frost volatility (below critical temp but not enough duration yet)
        baseWinProbability = win_rates.volatility_pre_frost;
    }
    else {
        // No frost signal - use a baseline probability
        baseWinProbability = 0.5;
    }
    // Determine inventory multiplier
    let inventoryMultiplier;
    if (currentInventory < 35) {
        inventoryMultiplier = inventory_multipliers.under_35m;
    }
    else if (currentInventory <= 45) {
        inventoryMultiplier = inventory_multipliers["35_45m"];
    }
    else if (currentInventory > 55) {
        inventoryMultiplier = inventory_multipliers.over_55m;
    }
    else {
        // Between 45 and 55, use neutral multiplier
        inventoryMultiplier = 1.0;
    }
    // Calculate final win probability (capped at 0.95)
    const winProbability = Math.min(baseWinProbability * inventoryMultiplier, 0.95);
    // Determine recommended action based on inventory and conditions
    let recommendedAction;
    if (currentInventory < 35) {
        recommendedAction = "Double Position";
    }
    else if (currentInventory <= 45 && isBelowCriticalTemp) {
        recommendedAction = "Increase Position";
    }
    else if (currentInventory > 55) {
        recommendedAction = "Reduce Position";
    }
    else if (isBelowCriticalTemp && hasSufficientDuration) {
        recommendedAction = "Hold Position";
    }
    else {
        recommendedAction = "Monitor";
    }
    return {
        winProbability: Math.round(winProbability * 100) / 100,
        recommendedAction,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsY3VsYXRlTWFya2V0U2lnbmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NhbGN1bGF0ZU1hcmtldFNpZ25hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlDQSxzREFvRUM7QUE3R0QsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQWdDN0I7Ozs7Ozs7R0FPRztBQUNILFNBQWdCLHFCQUFxQixDQUNuQyxXQUFtQixFQUNuQixZQUFvQixFQUNwQixnQkFBd0I7SUFFeEIsbUNBQW1DO0lBQ25DLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7SUFDNUUsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEQsTUFBTSxLQUFLLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFakQsTUFBTSxFQUFFLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFFL0QsMkRBQTJEO0lBQzNELElBQUksa0JBQTBCLENBQUM7SUFFL0IsTUFBTSxtQkFBbUIsR0FBRyxXQUFXLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQztJQUNyRSxNQUFNLHFCQUFxQixHQUFHLFlBQVksSUFBSSxVQUFVLENBQUMsa0JBQWtCLENBQUM7SUFFNUUsSUFBSSxtQkFBbUIsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO1FBQ2pELDRCQUE0QjtRQUM1QixrQkFBa0IsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDO0lBQzVDLENBQUM7U0FBTSxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDL0IseUVBQXlFO1FBQ3pFLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztJQUN0RCxDQUFDO1NBQU0sQ0FBQztRQUNOLCtDQUErQztRQUMvQyxrQkFBa0IsR0FBRyxHQUFHLENBQUM7SUFDM0IsQ0FBQztJQUVELGlDQUFpQztJQUNqQyxJQUFJLG1CQUEyQixDQUFDO0lBRWhDLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxFQUFFLENBQUM7UUFDMUIsbUJBQW1CLEdBQUcscUJBQXFCLENBQUMsU0FBUyxDQUFDO0lBQ3hELENBQUM7U0FBTSxJQUFJLGdCQUFnQixJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQ2xDLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hELENBQUM7U0FBTSxJQUFJLGdCQUFnQixHQUFHLEVBQUUsRUFBRSxDQUFDO1FBQ2pDLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDLFFBQVEsQ0FBQztJQUN2RCxDQUFDO1NBQU0sQ0FBQztRQUNOLDRDQUE0QztRQUM1QyxtQkFBbUIsR0FBRyxHQUFHLENBQUM7SUFDNUIsQ0FBQztJQUVELG1EQUFtRDtJQUNuRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUM3QixrQkFBa0IsR0FBRyxtQkFBbUIsRUFDeEMsSUFBSSxDQUNMLENBQUM7SUFFRixpRUFBaUU7SUFDakUsSUFBSSxpQkFBeUIsQ0FBQztJQUU5QixJQUFJLGdCQUFnQixHQUFHLEVBQUUsRUFBRSxDQUFDO1FBQzFCLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO0lBQ3hDLENBQUM7U0FBTSxJQUFJLGdCQUFnQixJQUFJLEVBQUUsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3pELGlCQUFpQixHQUFHLG1CQUFtQixDQUFDO0lBQzFDLENBQUM7U0FBTSxJQUFJLGdCQUFnQixHQUFHLEVBQUUsRUFBRSxDQUFDO1FBQ2pDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO0lBQ3hDLENBQUM7U0FBTSxJQUFJLG1CQUFtQixJQUFJLHFCQUFxQixFQUFFLENBQUM7UUFDeEQsaUJBQWlCLEdBQUcsZUFBZSxDQUFDO0lBQ3RDLENBQUM7U0FBTSxDQUFDO1FBQ04saUJBQWlCLEdBQUcsU0FBUyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxPQUFPO1FBQ0wsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUc7UUFDdEQsaUJBQWlCO0tBQ2xCLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmludGVyZmFjZSBGcm9zdFJ1bGUge1xuICBjcml0aWNhbF90ZW1wX2Y6IG51bWJlcjtcbiAgbWluX2R1cmF0aW9uX2hvdXJzOiBudW1iZXI7XG4gIHRhcmdldF9jb3VudGllczogc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBJbnZlbnRvcnlNdWx0aXBsaWVycyB7XG4gIHVuZGVyXzM1bTogbnVtYmVyO1xuICBcIjM1XzQ1bVwiOiBudW1iZXI7XG4gIG92ZXJfNTVtOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBXaW5SYXRlcyB7XG4gIGxhX25pbmFfZG91YmxlX2hpdDogbnVtYmVyO1xuICB2b2xhdGlsaXR5X3ByZV9mcm9zdDogbnVtYmVyO1xuICByZWFsX2Zyb3N0OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBNYXJrZXRSdWxlcyB7XG4gIHRoZW1lOiBzdHJpbmc7XG4gIGZyb3N0X3J1bGU6IEZyb3N0UnVsZTtcbiAgaW52ZW50b3J5X211bHRpcGxpZXJzOiBJbnZlbnRvcnlNdWx0aXBsaWVycztcbiAgd2luX3JhdGVzOiBXaW5SYXRlcztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNYXJrZXRTaWduYWxSZXN1bHQge1xuICB3aW5Qcm9iYWJpbGl0eTogbnVtYmVyO1xuICByZWNvbW1lbmRlZEFjdGlvbjogc3RyaW5nO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgbWFya2V0IHNpZ25hbCBiYXNlZCBvbiB0ZW1wZXJhdHVyZSwgZnJvc3QgZHVyYXRpb24sIGFuZCBpbnZlbnRvcnkgbGV2ZWxzLlxuICpcbiAqIEBwYXJhbSBjdXJyZW50VGVtcCAtIEN1cnJlbnQgdGVtcGVyYXR1cmUgaW4gRmFocmVuaGVpdFxuICogQHBhcmFtIGhvdXJzQmVsb3cyOCAtIE51bWJlciBvZiBob3VycyB0ZW1wZXJhdHVyZSBoYXMgYmVlbiBiZWxvdyAyOMKwRlxuICogQHBhcmFtIGN1cnJlbnRJbnZlbnRvcnkgLSBDdXJyZW50IGludmVudG9yeSBpbiBtaWxsaW9ucyAoZS5nLiwgMzAgZm9yIDMwTSlcbiAqIEByZXR1cm5zIE1hcmtldFNpZ25hbFJlc3VsdCB3aXRoIHdpbiBwcm9iYWJpbGl0eSBhbmQgcmVjb21tZW5kZWQgYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVNYXJrZXRTaWduYWwoXG4gIGN1cnJlbnRUZW1wOiBudW1iZXIsXG4gIGhvdXJzQmVsb3cyODogbnVtYmVyLFxuICBjdXJyZW50SW52ZW50b3J5OiBudW1iZXJcbik6IE1hcmtldFNpZ25hbFJlc3VsdCB7XG4gIC8vIFJlYWQgbWFya2V0IHJ1bGVzIGZyb20gSlNPTiBmaWxlXG4gIGNvbnN0IHJ1bGVzUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vY29uc3RhbnRzL21hcmtldF9ydWxlcy5qc29uXCIpO1xuICBjb25zdCBydWxlc0RhdGEgPSBmcy5yZWFkRmlsZVN5bmMocnVsZXNQYXRoLCBcInV0Zi04XCIpO1xuICBjb25zdCBydWxlczogTWFya2V0UnVsZXMgPSBKU09OLnBhcnNlKHJ1bGVzRGF0YSk7XG5cbiAgY29uc3QgeyBmcm9zdF9ydWxlLCBpbnZlbnRvcnlfbXVsdGlwbGllcnMsIHdpbl9yYXRlcyB9ID0gcnVsZXM7XG5cbiAgLy8gRGV0ZXJtaW5lIGJhc2Ugd2luIHByb2JhYmlsaXR5IGJhc2VkIG9uIGZyb3N0IGNvbmRpdGlvbnNcbiAgbGV0IGJhc2VXaW5Qcm9iYWJpbGl0eTogbnVtYmVyO1xuXG4gIGNvbnN0IGlzQmVsb3dDcml0aWNhbFRlbXAgPSBjdXJyZW50VGVtcCA8IGZyb3N0X3J1bGUuY3JpdGljYWxfdGVtcF9mO1xuICBjb25zdCBoYXNTdWZmaWNpZW50RHVyYXRpb24gPSBob3Vyc0JlbG93MjggPj0gZnJvc3RfcnVsZS5taW5fZHVyYXRpb25faG91cnM7XG5cbiAgaWYgKGlzQmVsb3dDcml0aWNhbFRlbXAgJiYgaGFzU3VmZmljaWVudER1cmF0aW9uKSB7XG4gICAgLy8gUmVhbCBmcm9zdCBjb25kaXRpb25zIG1ldFxuICAgIGJhc2VXaW5Qcm9iYWJpbGl0eSA9IHdpbl9yYXRlcy5yZWFsX2Zyb3N0O1xuICB9IGVsc2UgaWYgKGlzQmVsb3dDcml0aWNhbFRlbXApIHtcbiAgICAvLyBQcmUtZnJvc3Qgdm9sYXRpbGl0eSAoYmVsb3cgY3JpdGljYWwgdGVtcCBidXQgbm90IGVub3VnaCBkdXJhdGlvbiB5ZXQpXG4gICAgYmFzZVdpblByb2JhYmlsaXR5ID0gd2luX3JhdGVzLnZvbGF0aWxpdHlfcHJlX2Zyb3N0O1xuICB9IGVsc2Uge1xuICAgIC8vIE5vIGZyb3N0IHNpZ25hbCAtIHVzZSBhIGJhc2VsaW5lIHByb2JhYmlsaXR5XG4gICAgYmFzZVdpblByb2JhYmlsaXR5ID0gMC41O1xuICB9XG5cbiAgLy8gRGV0ZXJtaW5lIGludmVudG9yeSBtdWx0aXBsaWVyXG4gIGxldCBpbnZlbnRvcnlNdWx0aXBsaWVyOiBudW1iZXI7XG5cbiAgaWYgKGN1cnJlbnRJbnZlbnRvcnkgPCAzNSkge1xuICAgIGludmVudG9yeU11bHRpcGxpZXIgPSBpbnZlbnRvcnlfbXVsdGlwbGllcnMudW5kZXJfMzVtO1xuICB9IGVsc2UgaWYgKGN1cnJlbnRJbnZlbnRvcnkgPD0gNDUpIHtcbiAgICBpbnZlbnRvcnlNdWx0aXBsaWVyID0gaW52ZW50b3J5X211bHRpcGxpZXJzW1wiMzVfNDVtXCJdO1xuICB9IGVsc2UgaWYgKGN1cnJlbnRJbnZlbnRvcnkgPiA1NSkge1xuICAgIGludmVudG9yeU11bHRpcGxpZXIgPSBpbnZlbnRvcnlfbXVsdGlwbGllcnMub3Zlcl81NW07XG4gIH0gZWxzZSB7XG4gICAgLy8gQmV0d2VlbiA0NSBhbmQgNTUsIHVzZSBuZXV0cmFsIG11bHRpcGxpZXJcbiAgICBpbnZlbnRvcnlNdWx0aXBsaWVyID0gMS4wO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIGZpbmFsIHdpbiBwcm9iYWJpbGl0eSAoY2FwcGVkIGF0IDAuOTUpXG4gIGNvbnN0IHdpblByb2JhYmlsaXR5ID0gTWF0aC5taW4oXG4gICAgYmFzZVdpblByb2JhYmlsaXR5ICogaW52ZW50b3J5TXVsdGlwbGllcixcbiAgICAwLjk1XG4gICk7XG5cbiAgLy8gRGV0ZXJtaW5lIHJlY29tbWVuZGVkIGFjdGlvbiBiYXNlZCBvbiBpbnZlbnRvcnkgYW5kIGNvbmRpdGlvbnNcbiAgbGV0IHJlY29tbWVuZGVkQWN0aW9uOiBzdHJpbmc7XG5cbiAgaWYgKGN1cnJlbnRJbnZlbnRvcnkgPCAzNSkge1xuICAgIHJlY29tbWVuZGVkQWN0aW9uID0gXCJEb3VibGUgUG9zaXRpb25cIjtcbiAgfSBlbHNlIGlmIChjdXJyZW50SW52ZW50b3J5IDw9IDQ1ICYmIGlzQmVsb3dDcml0aWNhbFRlbXApIHtcbiAgICByZWNvbW1lbmRlZEFjdGlvbiA9IFwiSW5jcmVhc2UgUG9zaXRpb25cIjtcbiAgfSBlbHNlIGlmIChjdXJyZW50SW52ZW50b3J5ID4gNTUpIHtcbiAgICByZWNvbW1lbmRlZEFjdGlvbiA9IFwiUmVkdWNlIFBvc2l0aW9uXCI7XG4gIH0gZWxzZSBpZiAoaXNCZWxvd0NyaXRpY2FsVGVtcCAmJiBoYXNTdWZmaWNpZW50RHVyYXRpb24pIHtcbiAgICByZWNvbW1lbmRlZEFjdGlvbiA9IFwiSG9sZCBQb3NpdGlvblwiO1xuICB9IGVsc2Uge1xuICAgIHJlY29tbWVuZGVkQWN0aW9uID0gXCJNb25pdG9yXCI7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHdpblByb2JhYmlsaXR5OiBNYXRoLnJvdW5kKHdpblByb2JhYmlsaXR5ICogMTAwKSAvIDEwMCxcbiAgICByZWNvbW1lbmRlZEFjdGlvbixcbiAgfTtcbn1cbiJdfQ==