import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";

const VoucherForm = ({ onSubmit, onCancel, isLoading, initialData = {} }) => {
  const [formData, setFormData] = useState({
    code: initialData.code || "",
    description: initialData.description || "",
    discount: initialData.discount || "",
    max_claims: initialData.max_claims || "",
    status: initialData.status || "active"
  });
  
  const [isExpiryOpen, setIsExpiryOpen] = useState(false);
  const [expiryDate, setExpiryDate] = useState(
    initialData.expiry_date ? new Date(initialData.expiry_date) : null
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expiry_date: expiryDate ? format(expiryDate, 'yyyy-MM-dd') : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Code and Description */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Voucher Code
          </label>
          <input
            name="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="e.g. WELCOME10"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 min-h-[80px] resize-none"
            placeholder="Enter voucher description"
          />
        </div>
      </div>

      {/* Discount and Claims */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Discount (%)
          </label>
          <input
            type="number"
            name="discount"
            min="0"
            max="100"
            value={formData.discount}
            onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="0-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Maximum Claims
          </label>
          <input
            type="number"
            name="max_claims"
            min="0"
            value={formData.max_claims}
            onChange={(e) => setFormData(prev => ({ ...prev, max_claims: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="Unlimited"
          />
        </div>
      </div>

      {/* Expiry and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Expiry Date
          </label>
          <button
            type="button"
            onClick={() => setIsExpiryOpen(!isExpiryOpen)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {expiryDate ? format(expiryDate, "MMM dd, yyyy") : "Set expiry date"}
            </span>
          </button>

          {isExpiryOpen && (
            <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4">
              <DayPicker
                mode="single"
                selected={expiryDate}
                onSelect={(date) => {
                  setExpiryDate(date);
                  setIsExpiryOpen(false);
                }}
                defaultMonth={expiryDate || new Date()}
                fromDate={new Date()}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Creating...
            </>
          ) : (
            'Create Voucher'
          )}
        </button>
      </div>
    </form>
  );
};

export default VoucherForm; 