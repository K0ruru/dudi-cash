import { useState, useEffect } from "react";
import { Download, Eye, ArrowUpDown, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { transactionAPI } from "../services/api";
import { formatToRupiah } from "../utils/formatters";
import { generateTransactionPDF } from "../utils/pdfGenerator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });

  useEffect(() => {
    fetchTransactions();
  }, [dateFilter, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (dateRange?.from) {
        params.startDate = format(dateRange.from, 'yyyy-MM-dd');
        params.endDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(dateRange.from, 'yyyy-MM-dd');
      } else if (dateFilter !== 'all') {
        const now = new Date();
        const today = format(now, 'yyyy-MM-dd');
        
        switch (dateFilter) {
          case 'today':
            params.startDate = today;
            params.endDate = today;
            break;
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            params.startDate = format(weekAgo, 'yyyy-MM-dd');
            params.endDate = format(new Date(), 'yyyy-MM-dd');
            break;
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            params.startDate = format(monthAgo, 'yyyy-MM-dd');
            params.endDate = format(new Date(), 'yyyy-MM-dd');
            break;
        }
      }

      const data = await transactionAPI.getAll(params);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    switch (sortConfig.key) {
      case 'created_at':
        return direction * (new Date(a.created_at) - new Date(b.created_at));
      case 'total':
        return direction * (parseFloat(a.total) - parseFloat(b.total));
      case 'items':
        return direction * ((a.items?.length || 0) - (b.items?.length || 0));
      case 'transaction_id':
      case 'customer_id':
      case 'status':
        return direction * String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]));
      default:
        return 0;
    }
  });

  const handleExport = async () => {
    try {
      await generateTransactionPDF(sortedTransactions, dateRange);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      alert('Failed to export transactions');
    }
  };

  const resetFilters = () => {
    setDateFilter('all');
    setDateRange(null);
  };

  const SortableHeader = ({ label, sortKey }) => (
    <th 
      className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer group"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className={`w-4 h-4 transition-colors ${
          sortConfig.key === sortKey ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'
        }`} />
      </div>
    </th>
  );

  if (loading) {
    return <div className="p-8 text-center">Loading transactions...</div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDateFilter('today');
                setDateRange(null);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${dateFilter === 'today' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Today
            </button>
            <button
              onClick={() => {
                setDateFilter('week');
                setDateRange(null);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${dateFilter === 'week' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                setDateFilter('month');
                setDateRange(null);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${dateFilter === 'month' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Last 30 Days
            </button>
            {(dateFilter !== 'all' || dateRange) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <div className="h-8 w-px bg-gray-200" /> {/* Divider */}

          {/* Custom Date Range */}
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={(range) => {
              setDateRange(range);
              setDateFilter('all');
            }}
            className="flex-1"
          />

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors ml-auto"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <SortableHeader label="ID" sortKey="transaction_id" />
                <SortableHeader label="Date" sortKey="created_at" />
                <SortableHeader label="Items" sortKey="items" />
                <SortableHeader label="Amount" sortKey="total" />
                <SortableHeader label="Paid" sortKey="total_paid" />
                <SortableHeader label="Status" sortKey="status" />
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {transaction.transaction_id.slice(-8)}
                  </td>
                  <td className="px-6 py-4">
                    {format(new Date(transaction.created_at), "dd MMM yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    {transaction.items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatToRupiah(transaction.total)}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatToRupiah(transaction.total_paid)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        transaction.status === "completed"
                          ? "bg-green-50 text-green-600"
                          : transaction.status === "voided"
                          ? "bg-red-50 text-red-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{selectedTransaction.transaction_id}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTransaction.status === "completed"
                      ? "bg-green-50 text-green-600"
                      : selectedTransaction.status === "voided"
                      ? "bg-red-50 text-red-600"
                      : "bg-yellow-50 text-yellow-600"
                  }`}
                >
                  {selectedTransaction.status}
                </span>
              </div>

              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedTransaction.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-500">
                            {formatToRupiah(item.price_at_time)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        {formatToRupiah(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatToRupiah(selectedTransaction.subtotal)}</span>
                </div>
                {selectedTransaction.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatToRupiah(selectedTransaction.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatToRupiah(selectedTransaction.total)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-500">Paid Amount</span>
                  <span>{formatToRupiah(selectedTransaction.total_paid)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
