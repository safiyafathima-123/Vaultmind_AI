// src/components/PoolTable.tsx
"use client";

import { useMarketData } from "@/lib/useMarketData";
import {
  formatAPY,
  formatTVL,
  volatilityLabel,
  volatilityColor,
} from "@/lib/poolData";

export default function PoolTable() {
  const { pools, isLoading, error, lastUpdated, refresh } = useMarketData();

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm animate-pulse">
        Fetching market data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-sm text-center">
        {error} — showing demo data
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h3 className="font-semibold text-gray-800 text-sm">Live pool data</h3>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
            <th className="text-left px-5 py-3 font-medium">Pool</th>
            <th className="text-right px-5 py-3 font-medium">APY</th>
            <th className="text-right px-5 py-3 font-medium">Volatility</th>
            <th className="text-right px-5 py-3 font-medium">TVL</th>
            <th className="text-right px-5 py-3 font-medium">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool, i) => (
            <tr
              key={pool.id}
              className={`border-t border-gray-50 hover:bg-purple-50/30 transition-colors ${
                i === 0 ? "border-t-0" : ""
              }`}
            >
              <td className="px-5 py-3 font-medium text-gray-800">{pool.name}</td>
              <td className="px-5 py-3 text-right font-semibold text-green-600">
                {formatAPY(pool.apy)}
              </td>
              <td className={`px-5 py-3 text-right font-medium ${volatilityColor(pool.volatility)}`}>
                {volatilityLabel(pool.volatility)}
              </td>
              <td className="px-5 py-3 text-right text-gray-500">
                {formatTVL(pool.tvl)}
              </td>
              <td className="px-5 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${pool.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-500 text-xs">
                    {Math.round(pool.confidence * 100)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
