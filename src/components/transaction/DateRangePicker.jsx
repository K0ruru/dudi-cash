import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DateRangePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button 
            className={cn(
              "min-w-[300px] justify-start text-left font-normal",
              "px-6 py-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors flex items-center gap-2",
              !value && "text-gray-500"
            )}
          >
            <CalendarIcon className="w-4 h-4 opacity-50" />
            {value?.from ? (
              value.to ? (
                <>
                  <span>
                    {format(value.from, "LLL dd, y")} -{" "}
                    {format(value.to, "LLL dd, y")}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    {Math.ceil(
                      (value.to - value.from) / (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              "Select date range"
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div>
              <h4 className="font-medium">Select Range</h4>
              <p className="text-sm text-gray-500">
                {!value?.from 
                  ? "Select start date" 
                  : !value?.to 
                    ? "Select end date"
                    : "Date range selected"}
              </p>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={(range) => {
                onChange(range);
                if (range?.to) {
                  setIsOpen(false);
                }
              }}
              numberOfMonths={1}
              disabled={(date) => date < new Date("1900-01-01")}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker; 