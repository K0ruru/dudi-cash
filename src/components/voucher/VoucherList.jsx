import { useState, useEffect } from "react";
import { 
  ArrowUpDown, 
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  Pencil
} from "lucide-react";
import VoucherModal from "./VoucherModal";
import { voucherAPI } from "../../services/api";
import { formatToRupiah } from "../../utils/formatters";

const VoucherList = ({ 
  searchQuery = "", 
  filterStatus, 
  setFilterStatus,
  vouchers,
  setVouchers,
  onEdit
}) => {
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await voucherAPI.getAll();
      setVouchers(data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleDeleteVoucher = async (code) => {
    try {
      await voucherAPI.delete(code);
      await fetchVouchers();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Failed to delete voucher');
    }
  };

  const handleSaveVoucher = async (voucherData) => {
    try {
      if (selectedVoucher) {
        await voucherAPI.update(selectedVoucher.code, voucherData);
      } else {
        await voucherAPI.create(voucherData);
      }
      await fetchVouchers();
      setSelectedVoucher(null);
    } catch (error) {
      console.error('Error saving voucher:', error);
      alert('Failed to save voucher');
    }
  };

  const filteredVouchers = vouchers
    .filter(voucher => {
      const matchesSearch = voucher.code.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
                          voucher.description.toLowerCase().includes(searchQuery?.toLowerCase() || '');
      const matchesStatus = filterStatus === "all" || voucher.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const multiplier = sortConfig.direction === "asc" ? 1 : -1;
      if (sortConfig.key === "claimed") {
        return multiplier * ((a.claimed_count / (a.max_claims || Infinity)) - 
                           (b.claimed_count / (b.max_claims || Infinity)));
      }
      return multiplier * (a[sortConfig.key] > b[sortConfig.key] ? 1 : -1);
    });

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Status Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${filterStatus === "all" 
                ? "bg-gray-900 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${filterStatus === "active" 
                ? "bg-gray-900 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus("inactive")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${filterStatus === "inactive" 
                ? "bg-gray-900 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                <button
                  onClick={() => handleSort("code")}
                  className="flex items-center gap-2"
                >
                  Code
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                Description
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                <button
                  onClick={() => handleSort("discount")}
                  className="flex items-center gap-2"
                >
                  Discount
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                <button
                  onClick={() => handleSort("claimed")}
                  className="flex items-center gap-2"
                >
                  Claims
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                <button
                  onClick={() => handleSort("expiry_date")}
                  className="flex items-center gap-2"
                >
                  Expiry Date
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredVouchers.map((voucher) => (
              <tr key={voucher.code} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{voucher.code}</td>
                <td className="px-6 py-4 text-gray-500">{voucher.description}</td>
                <td className="px-6 py-4">{voucher.discount}%</td>
                <td className="px-6 py-4">
                  {voucher.claimed_count}/{voucher.max_claims || "∞"}
                </td>
                <td className="px-6 py-4">
                  {new Date(voucher.expiry_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      voucher.status === "active"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {voucher.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(voucher)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVoucher(voucher.code)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Delete Voucher</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this voucher? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVoucher(selectedVoucher.code)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherList; 