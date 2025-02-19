import { useState } from "react";
import { format } from "date-fns";

export function DateRangePicker({ dateRange, onDateRangeChange, className }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="date"
        value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
        onChange={(e) => {
          const from = e.target.value ? new Date(e.target.value) : null;
          onDateRangeChange({ from, to: dateRange?.to });
        }}
        className="px-3 py-2 rounded-lg border border-gray-200"
      />
      <span className="text-gray-500">to</span>
      <input
        type="date"
        value={dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
        onChange={(e) => {
          const to = e.target.value ? new Date(e.target.value) : null;
          onDateRangeChange({ from: dateRange?.from, to });
        }}
        className="px-3 py-2 rounded-lg border border-gray-200"
      />
    </div>
  );
} 