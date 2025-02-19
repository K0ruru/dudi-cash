import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import VoucherList from "@/components/voucher/VoucherList";
import VoucherStats from "@/components/voucher/VoucherStats";
import VoucherHeader from "@/components/voucher/VoucherHeader";
import VoucherForm from "@/components/voucher/VoucherForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { voucherAPI } from "../services/api";

const Voucher = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

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
      toast.error('Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVoucher = async (formData) => {
    try {
      setLoading(true);
      let response;
      
      if (selectedVoucher) {
        response = await voucherAPI.update(selectedVoucher.code, formData);
        setVouchers(prev => prev.map(v => 
          v.code === selectedVoucher.code ? response.data : v
        ));
        toast.success('Voucher updated successfully', {
          style: {
            background: '#22c55e',
            color: '#fff',
            borderRadius: '0.75rem',
          },
        });
      } else {
        response = await voucherAPI.create(formData);
        await fetchVouchers();
        toast.success('Voucher created successfully', {
          style: {
            background: '#22c55e',
            color: '#fff',
            borderRadius: '0.75rem',
          },
        });
      }
      
      setShowModal(false);
      setSelectedVoucher(null);
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast.error(error.message || 'Failed to save voucher', {
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '0.75rem',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <VoucherHeader onAddClick={() => {
        setSelectedVoucher(null);
        setShowModal(true);
      }} />
      
      <div className="mt-8">
        <VoucherStats />
      </div>

      <div className="mt-8">
        <VoucherList 
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          vouchers={vouchers}
          setVouchers={setVouchers}
          onEdit={(voucher) => {
            setSelectedVoucher(voucher);
            setShowModal(true);
          }}
        />
      </div>

      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) setSelectedVoucher(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {selectedVoucher ? 'Edit Voucher' : 'Create New Voucher'}
            </h2>
            <button 
              onClick={() => {
                setShowModal(false);
                setSelectedVoucher(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <VoucherForm 
            initialData={selectedVoucher}
            onSubmit={handleSaveVoucher}
            onCancel={() => {
              setShowModal(false);
              setSelectedVoucher(null);
            }}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Voucher; 