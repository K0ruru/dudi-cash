import { useCart } from "../../contexts/CartContext";
import { formatToRupiah } from "../../utils/formatters";
import { useState } from "react";
import { Filter } from "lucide-react";

const ProductGrid = ({ products }) => {
  const { addToCart, productStocks } = useCart();
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    availability: 'all',
    sortBy: 'name'
  });

  // Extract unique categories from products
  const categories = ['all', ...new Set(products.map(p => p.category))];

  const getProductStock = (product) => {
    // If we have a tracked stock, use it, otherwise use the original stock
    return productStocks[product.id] !== undefined 
      ? productStocks[product.id] 
      : product.stock;
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const currentStock = getProductStock(product);
    
    if (activeFilters.category !== 'all' && product.category !== activeFilters.category) {
      return false;
    }
    
    if (activeFilters.availability === 'in-stock' && currentStock === 0) {
      return false;
    }
    if (activeFilters.availability === 'out-of-stock' && currentStock > 0) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (activeFilters.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">Category:</span>
            <select
              value={activeFilters.category}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-1.5 rounded-lg bg-gray-50 border-none text-sm focus:ring-2 focus:ring-gray-200"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">Availability:</span>
            <select
              value={activeFilters.availability}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="px-3 py-1.5 rounded-lg bg-gray-50 border-none text-sm focus:ring-2 focus:ring-gray-200"
            >
              <option value="all">All</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={activeFilters.sortBy}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-1.5 rounded-lg bg-gray-50 border-none text-sm focus:ring-2 focus:ring-gray-200"
            >
              <option value="name">Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => setActiveFilters({
              category: 'all',
              availability: 'all',
              sortBy: 'name'
            })}
            className="ml-auto px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map(({ id, name, price, image, category, description, stock, popular, supplier }) => {
          const currentStock = getProductStock({ id, name, price, image, category, description, stock, popular, supplier });
          const isOutOfStock = currentStock === 0;

          return (
            <div
              key={id}
              onClick={() => !isOutOfStock && addToCart({ id, name, price, image, category, description, stock, popular, supplier })}
              className={`group bg-white rounded-2xl overflow-hidden shadow-sm 
                transition-all duration-200 cursor-pointer
                ${!isOutOfStock 
                  ? "hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50" 
                  : "opacity-60 cursor-not-allowed"
                }`}
            >
              {/* Image Container */}
              <div className="relative w-full h-48 bg-gray-900">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-3xl text-white font-bold">{name}</h2>
                  </div>
                )}
                {popular && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2.5 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                      {name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {description}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 whitespace-nowrap">
                    {formatToRupiah(price)}
                  </span>
                </div>

                {/* Stock and Action */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        isOutOfStock 
                          ? "bg-red-500" 
                          : currentStock < 10 
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                    <span className={`text-sm font-medium ${
                      isOutOfStock 
                        ? "text-red-500" 
                        : currentStock < 10 
                          ? "text-yellow-700"
                          : "text-green-700"
                    }`}>
                      {isOutOfStock 
                        ? "Out of Stock" 
                        : `${currentStock} in stock`}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 group-hover:text-gray-700">
                    {!isOutOfStock ? "Click to add" : "Not available"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products match your filters</p>
          <button
            onClick={() => setActiveFilters({
              category: 'all',
              availability: 'all',
              sortBy: 'name'
            })}
            className="mt-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid; 