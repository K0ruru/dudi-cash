import { Plus } from "lucide-react";

const VoucherHeader = ({ onAddClick }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Voucher Management</h1>
        <p className="text-gray-500 mt-1">Create and manage discount vouchers</p>
      </div>
      <button
        onClick={onAddClick}
        className="px-4 py-2 bg-gray-900 text-white rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Create Voucher
      </button>
    </div>
  );
};

export default VoucherHeader; 