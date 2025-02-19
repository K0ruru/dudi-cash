import { useState } from "react";

import { DayPicker } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// This is just for individual inputs
const VoucherFormInput = ({ label, type = "text", ...props }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
        {...props}
      />
    </div>
  );
};

export default VoucherFormInput; 