import { Link } from "react-router-dom";
import { Package, Receipt, Tag, ChevronLeft, ShoppingCart } from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    {
      icon: ShoppingCart,
      label: "Cashier",
      path: "/",
      count: null
    },
    {
      icon: Package,
      label: "Inventory",
      count: "23",
      path: "/inventory"
    },
    {
      icon: Receipt,
      label: "Transactions",
      count: "5",
      path: "/transactions"
    },
    {
      icon: Tag,
      label: "Vouchers",
      count: "12",
      path: "/vouchers"
    }
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out bg-white w-80 z-30`}
      style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)" }}
    >
      <div className="p-8">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <nav className="space-y-4">
          {menuItems.map(({ icon: Icon, label, count, path }) => (
            <Link
              key={label}
              to={path}
              className="w-full group"
              onClick={onClose}
            >
              <div className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <Icon className="w-5 h-5" />
                  <span className="text-lg">{label}</span>
                </div>
                {count && (
                  <span className="text-sm px-2 py-1 rounded-md bg-gray-100">
                    {count}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 