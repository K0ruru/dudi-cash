import { Menu, ShoppingBag, Coffee, Bell } from "lucide-react";

const Header = ({ onMenuClick }) => {
  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-xl">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Coffee className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold tracking-tight">NexOPS</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
          <ShoppingBag className="w-5 h-5 text-gray-600" />
          <span className="font-medium">Cashier Mode</span>
        </div>
      </div>
    </div>
  );
};

export default Header; 