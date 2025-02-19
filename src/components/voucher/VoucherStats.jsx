import { useState, useEffect } from "react";
import { 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Ban 
} from "lucide-react";
import { voucherAPI } from "../../services/api";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-6 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  </div>
);

const VoucherStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const vouchers = await voucherAPI.getAll();
      const currentDate = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const statsData = {
        total: vouchers.length,
        active: vouchers.filter(v => v.status === 'active').length,
        expiringSoon: vouchers.filter(v => {
          const expiryDate = new Date(v.expiry_date);
          return v.status === 'active' && 
                 expiryDate > currentDate && 
                 expiryDate <= thirtyDaysFromNow;
        }).length,
        expired: vouchers.filter(v => v.status === 'expired').length
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching voucher stats:', error);
    }
  };

  const statCards = [
    {
      title: "Total Vouchers",
      value: stats.total,
      icon: Ticket,
      color: "bg-blue-50 text-blue-500"
    },
    {
      title: "Active Vouchers",
      value: stats.active,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-500"
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-500"
    },
    {
      title: "Expired",
      value: stats.expired,
      icon: Ban,
      color: "bg-red-50 text-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default VoucherStats; 