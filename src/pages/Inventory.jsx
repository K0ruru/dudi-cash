import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductForm from "../components/inventory/ProductForm";
import { productAPI } from "../services/api";
import { formatToRupiah } from "../utils/formatters";
import { getStockStatus } from "../utils/stockStatus";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";

// Dummy data
const dummyProducts = [
  {
    id: 1,
    name: "Americano",
    price: 3.99,
    image: "/api/placeholder/200/200",
    category: "Beverages",
    popular: true,
    description: "Rich espresso with hot water",
    stock: 50,
  },
  {
    id: 2,
    name: "Green Tea Latte",
    price: 4.99,
    image: "/api/placeholder/200/200",
    category: "Beverages",
    popular: false,
    description: "Matcha with steamed milk",
    stock: 25,
  },
  {
    id: 3,
    name: "Club Sandwich",
    price: 8.99,
    image: "/api/placeholder/200/200",
    category: "Food",
    popular: true,
    description: "Triple-decker classic",
    stock: 0,
  },
  {
    id: 4,
    name: "Chocolate Cake",
    price: 5.99,
    image: "/api/placeholder/200/200",
    category: "Desserts",
    popular: true,
    description: "Rich dark chocolate",
    stock: 12,
  },
  {
    id: 5,
    name: "Macarons Set",
    price: 12.99,
    image: "/api/placeholder/200/200",
    category: "Desserts",
    popular: false,
    description: "Assorted flavors",
    stock: 8,
  },
  {
    id: 6,
    name: "Caesar Salad",
    price: 7.99,
    image: "/api/placeholder/200/200",
    category: "Food",
    popular: false,
    description: "Fresh romaine lettuce",
    stock: 15,
  },
];

const inventoryData = [
  ...dummyProducts.map((product) => ({
    ...product,
    sku: `SKU${product.id}${Math.floor(Math.random() * 1000)}`,
    lastUpdated: new Date(
      2024,
      1,
      Math.floor(Math.random() * 28)
    ).toISOString(),
    supplier: ["ABC Foods", "XYZ Beverages", "Fresh Farms"][
      Math.floor(Math.random() * 3)
    ],
    reorderPoint: Math.floor(Math.random() * 10) + 5,
  })),
];

const Inventory = () => {
  const [inventory, setInventory] = useState(inventoryData);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    stockStatus: "all", // all, inStock, lowStock, outOfStock
    supplier: "all",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const categories = [
    "All",
    ...new Set(inventory.map((item) => item.category)),
  ];
  const suppliers = ["all", ...new Set(inventory.map((item) => item.supplier))];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, inventory, filters, sortConfig]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setInventory(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...inventory];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (item) => item.category === selectedCategory
      );
    }

    // Apply stock status filter
    if (filters.stockStatus !== "all") {
      filtered = filtered.filter((item) => {
        if (filters.stockStatus === "inStock") return item.stock >= 10;
        if (filters.stockStatus === "lowStock") return item.stock > 0 && item.stock < 10;
        if (filters.stockStatus === "outOfStock") return item.stock === 0;
        return true;
      });
    }

    // Apply supplier filter
    if (filters.supplier !== "all") {
      filtered = filtered.filter(
        (item) => item.supplier === filters.supplier
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredInventory(filtered);
  };

  const showToast = (title, description, variant = "success") => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateProduct = async (productData) => {
    try {
      const newProduct = await productAPI.create(productData);
      setInventory([...inventory, newProduct]);
      setShowAddModal(false);
      showToast(
        "Product Created",
        "Product has been successfully added to inventory"
      );
    } catch (err) {
      showToast(
        "Error",
        err.response?.data?.error || "Failed to create product",
        "error"
      );
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      const updatedProduct = await productAPI.update(id, productData);
      setInventory(inventory.map(p => 
        p.id === id ? { ...p, ...updatedProduct } : p
      ));
      setShowEditModal(false);
      setSelectedItem(null);
      showToast(
        "Product Updated",
        "Product has been successfully updated"
      );
    } catch (err) {
      showToast(
        "Error",
        err.response?.data?.error || "Failed to update product",
        "error"
      );
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productAPI.delete(id);
        setInventory(inventory.filter(p => p.id !== id));
        setProductToDelete(null);
        showToast(
          "Product Deleted",
          "Product has been successfully removed from inventory"
        );
      } catch (err) {
        showToast(
          "Error",
          err.response?.data?.error || "Failed to delete product",
          "error"
        );
      }
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (sortConfig.direction === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <ToastProvider>
      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[300px]">
            <div className="absolute inset-y-0 left-4 flex items-center">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-gray-200"
              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className="px-4 py-3 bg-white rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors"
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              >
                <Filter className="w-5 h-5" />
                Filters
                <ChevronDown className="w-4 h-4" />
              </button>

              {filterMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg z-10 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Stock Status
                      </label>
                      <select
                        value={filters.stockStatus}
                        onChange={(e) =>
                          setFilters({ ...filters, stockStatus: e.target.value })
                        }
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      >
                        <option value="all">All</option>
                        <option value="inStock">In Stock</option>
                        <option value="lowStock">Low Stock</option>
                        <option value="outOfStock">Out of Stock</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Supplier
                      </label>
                      <select
                        value={filters.supplier}
                        onChange={(e) =>
                          setFilters({ ...filters, supplier: e.target.value })
                        }
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      >
                        {suppliers.map((supplier) => (
                          <option key={supplier} value={supplier}>
                            {supplier.charAt(0).toUpperCase() + supplier.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 flex gap-4 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 text-lg rounded-xl transition-all duration-200 whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-gray-900 text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Inventory Table */}
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-2"
                    >
                      Product
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    <button
                      onClick={() => handleSort("stock")}
                      className="flex items-center gap-2"
                    >
                      Stock
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Supplier
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    <button
                      onClick={() => handleSort("price")}
                      className="flex items-center gap-2"
                    >
                      Price
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.stock);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{item.sku}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.stock}</td>
                      <td className="px-6 py-4">
                        <span 
                          className={`px-3 py-1 rounded-full text-sm ${stockStatus.color}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.supplier}</td>
                      <td className="px-6 py-4">{formatToRupiah(item.price)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowEditModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(item)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Dialog
          open={showAddModal || showEditModal}
          onOpenChange={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedItem(null);
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {showAddModal ? "Add New Product" : "Edit Product"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              product={selectedItem}
              onSubmit={(data) => {
                if (selectedItem) {
                  handleUpdateProduct(selectedItem.id, data);
                } else {
                  handleCreateProduct(data);
                }
              }}
              onCancel={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedItem(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {productToDelete?.name}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => handleDeleteProduct(productToDelete.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {toast && (
          <Toast variant={toast.variant}>
            <div>
              <ToastTitle>{toast.title}</ToastTitle>
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
};

export default Inventory;
