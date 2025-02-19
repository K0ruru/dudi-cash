import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import VoucherFormInput from "./VoucherFormInput";

const VoucherModal = ({ open, onClose, voucher = null, onSave }) => {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount: "",
    max_claims: "",
    expiry_date: "",
    status: "active"
  });

  const [date, setDate] = useState(null);

  useEffect(() => {
    if (voucher) {
      setDate(new Date(voucher.expiry_date));
      // Format the date properly
      const expiryDate = voucher.expiry_date ? 
        new Date(voucher.expiry_date).toISOString().split('T')[0] : 
        '';

      setFormData({
        code: voucher.code || '',
        description: voucher.description || '',
        discount: voucher.discount || '',
        max_claims: voucher.max_claims || '',
        expiry_date: expiryDate,
        status: voucher.status || 'active'
      });
    } else {
      setDate(null);
      // Reset form for new voucher
      setFormData({
        code: "",
        description: "",
        discount: "",
        max_claims: "",
        expiry_date: "",
        status: "active"
      });
    }
  }, [voucher]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert form data to proper types
      const voucherData = {
        ...formData,
        discount: parseFloat(formData.discount),
        max_claims: formData.max_claims ? parseInt(formData.max_claims) : null,
        claimed_count: voucher?.claimed_count || 0
      };

      await onSave(voucherData);
      onClose();
    } catch (error) {
      console.error('Error saving voucher:', error);
      alert('Failed to save voucher');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {voucher ? 'Edit Voucher' : 'Create New Voucher'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <VoucherFormInput
            label="Voucher Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            disabled={!!voucher}
            required
          />

          <VoucherFormInput
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <VoucherFormInput
            label="Discount (%)"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />

          <VoucherFormInput
            label="Maximum Claims"
            name="max_claims"
            type="number"
            value={formData.max_claims}
            onChange={handleChange}
            min="0"
            placeholder="Leave empty for unlimited"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Expiry Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-gray-200",
                    !date && "text-gray-500"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setFormData(prev => ({
                      ...prev,
                      expiry_date: newDate ? format(newDate, "yyyy-MM-dd") : ""
                    }));
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-gray-200"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              {voucher ? "Save Changes" : "Create Voucher"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VoucherModal; 