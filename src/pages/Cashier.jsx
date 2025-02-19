import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import ProductGrid from "../components/cashier/ProductGrid";
import Cart from "../components/cashier/Cart";
import { productAPI } from "../services/api";
import Header from "../components/layout/Header";

const Cashier = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getAll();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-8 py-6 bg-white">
          <Header
            onMenuClick={onMenuClick}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-8">
          <div className="py-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border-none bg-white focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div className="mt-6">
              <ProductGrid products={filteredProducts} />
            </div>
          </div>
        </div>
      </div>
      <Cart />
    </div>
  );
};

export default Cashier; 