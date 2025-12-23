"use strict";
/**
 * Market Data Stream Service
 * Simulates fetching live market data from an external API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLiveMarketData = fetchLiveMarketData;
exports.formatSyncTime = formatSyncTime;
/**
 * Simulates an API call to fetch live market data.
 * In production, this would connect to a real weather/market data API.
 *
 * @param delayMs - Simulated network delay in milliseconds (default: 800ms)
 * @returns Promise resolving to LiveMarketData
 */
function fetchLiveMarketData(delayMs = 800) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate realistic Florida winter temperature (15-50°F range)
            // More likely to be in the 25-40°F range during frost season
            const currentTemp = Math.round(Math.random() < 0.3
                ? 15 + Math.random() * 15 // 30% chance of cold snap (15-30°F)
                : 30 + Math.random() * 20 // 70% chance of mild weather (30-50°F)
            );
            // Simulate inventory levels (20-70M range)
            // Tends toward middle values with occasional extremes
            const inventoryBase = 35 + Math.random() * 20; // Base: 35-55M
            const inventoryVariance = (Math.random() - 0.5) * 30; // +/- 15M variance
            const inventory = Math.round(Math.max(20, Math.min(70, inventoryBase + inventoryVariance)));
            // Hurricane alerts are rare (10% chance)
            const isHurricaneAlert = Math.random() < 0.1;
            resolve({
                currentTemp,
                inventory,
                isHurricaneAlert,
                timestamp: new Date(),
            });
        }, delayMs);
    });
}
/**
 * Formats the timestamp for display
 */
function formatSyncTime(date) {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2V0RGF0YVN0cmVhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9tYXJrZXREYXRhU3RyZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7O0FBZ0JILGtEQThCQztBQUtELHdDQU1DO0FBaEREOzs7Ozs7R0FNRztBQUNILFNBQWdCLG1CQUFtQixDQUFDLFVBQWtCLEdBQUc7SUFDdkQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQzdCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxnRUFBZ0U7WUFDaEUsNkRBQTZEO1lBQzdELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQzVCLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHO2dCQUNqQixDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsb0NBQW9DO2dCQUM5RCxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsdUNBQXVDO2FBQ3BFLENBQUM7WUFFRiwyQ0FBMkM7WUFDM0Msc0RBQXNEO1lBQ3RELE1BQU0sYUFBYSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsZUFBZTtZQUM5RCxNQUFNLGlCQUFpQixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQjtZQUN6RSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxhQUFhLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUM5RCxDQUFDO1lBRUYseUNBQXlDO1lBQ3pDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQztZQUU3QyxPQUFPLENBQUM7Z0JBQ04sV0FBVztnQkFDWCxTQUFTO2dCQUNULGdCQUFnQjtnQkFDaEIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO2FBQ3RCLENBQUMsQ0FBQztRQUNMLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsY0FBYyxDQUFDLElBQVU7SUFDdkMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFO1FBQ3RDLElBQUksRUFBRSxTQUFTO1FBQ2YsTUFBTSxFQUFFLFNBQVM7UUFDakIsTUFBTSxFQUFFLFNBQVM7S0FDbEIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTWFya2V0IERhdGEgU3RyZWFtIFNlcnZpY2VcbiAqIFNpbXVsYXRlcyBmZXRjaGluZyBsaXZlIG1hcmtldCBkYXRhIGZyb20gYW4gZXh0ZXJuYWwgQVBJXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBMaXZlTWFya2V0RGF0YSB7XG4gIGN1cnJlbnRUZW1wOiBudW1iZXI7XG4gIGludmVudG9yeTogbnVtYmVyO1xuICBpc0h1cnJpY2FuZUFsZXJ0OiBib29sZWFuO1xuICB0aW1lc3RhbXA6IERhdGU7XG59XG5cbi8qKlxuICogU2ltdWxhdGVzIGFuIEFQSSBjYWxsIHRvIGZldGNoIGxpdmUgbWFya2V0IGRhdGEuXG4gKiBJbiBwcm9kdWN0aW9uLCB0aGlzIHdvdWxkIGNvbm5lY3QgdG8gYSByZWFsIHdlYXRoZXIvbWFya2V0IGRhdGEgQVBJLlxuICpcbiAqIEBwYXJhbSBkZWxheU1zIC0gU2ltdWxhdGVkIG5ldHdvcmsgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIChkZWZhdWx0OiA4MDBtcylcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIExpdmVNYXJrZXREYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaExpdmVNYXJrZXREYXRhKGRlbGF5TXM6IG51bWJlciA9IDgwMCk6IFByb21pc2U8TGl2ZU1hcmtldERhdGE+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAvLyBTaW11bGF0ZSByZWFsaXN0aWMgRmxvcmlkYSB3aW50ZXIgdGVtcGVyYXR1cmUgKDE1LTUwwrBGIHJhbmdlKVxuICAgICAgLy8gTW9yZSBsaWtlbHkgdG8gYmUgaW4gdGhlIDI1LTQwwrBGIHJhbmdlIGR1cmluZyBmcm9zdCBzZWFzb25cbiAgICAgIGNvbnN0IGN1cnJlbnRUZW1wID0gTWF0aC5yb3VuZChcbiAgICAgICAgTWF0aC5yYW5kb20oKSA8IDAuM1xuICAgICAgICAgID8gMTUgKyBNYXRoLnJhbmRvbSgpICogMTUgLy8gMzAlIGNoYW5jZSBvZiBjb2xkIHNuYXAgKDE1LTMwwrBGKVxuICAgICAgICAgIDogMzAgKyBNYXRoLnJhbmRvbSgpICogMjAgLy8gNzAlIGNoYW5jZSBvZiBtaWxkIHdlYXRoZXIgKDMwLTUwwrBGKVxuICAgICAgKTtcblxuICAgICAgLy8gU2ltdWxhdGUgaW52ZW50b3J5IGxldmVscyAoMjAtNzBNIHJhbmdlKVxuICAgICAgLy8gVGVuZHMgdG93YXJkIG1pZGRsZSB2YWx1ZXMgd2l0aCBvY2Nhc2lvbmFsIGV4dHJlbWVzXG4gICAgICBjb25zdCBpbnZlbnRvcnlCYXNlID0gMzUgKyBNYXRoLnJhbmRvbSgpICogMjA7IC8vIEJhc2U6IDM1LTU1TVxuICAgICAgY29uc3QgaW52ZW50b3J5VmFyaWFuY2UgPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiAzMDsgLy8gKy8tIDE1TSB2YXJpYW5jZVxuICAgICAgY29uc3QgaW52ZW50b3J5ID0gTWF0aC5yb3VuZChcbiAgICAgICAgTWF0aC5tYXgoMjAsIE1hdGgubWluKDcwLCBpbnZlbnRvcnlCYXNlICsgaW52ZW50b3J5VmFyaWFuY2UpKVxuICAgICAgKTtcblxuICAgICAgLy8gSHVycmljYW5lIGFsZXJ0cyBhcmUgcmFyZSAoMTAlIGNoYW5jZSlcbiAgICAgIGNvbnN0IGlzSHVycmljYW5lQWxlcnQgPSBNYXRoLnJhbmRvbSgpIDwgMC4xO1xuXG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgY3VycmVudFRlbXAsXG4gICAgICAgIGludmVudG9yeSxcbiAgICAgICAgaXNIdXJyaWNhbmVBbGVydCxcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLFxuICAgICAgfSk7XG4gICAgfSwgZGVsYXlNcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZvcm1hdHMgdGhlIHRpbWVzdGFtcCBmb3IgZGlzcGxheVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0U3luY1RpbWUoZGF0ZTogRGF0ZSk6IHN0cmluZyB7XG4gIHJldHVybiBkYXRlLnRvTG9jYWxlVGltZVN0cmluZyhcImVuLVVTXCIsIHtcbiAgICBob3VyOiBcIjItZGlnaXRcIixcbiAgICBtaW51dGU6IFwiMi1kaWdpdFwiLFxuICAgIHNlY29uZDogXCIyLWRpZ2l0XCIsXG4gIH0pO1xufVxuIl19