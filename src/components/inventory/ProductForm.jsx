import { useState, useEffect } from "react";
import ImageUpload from "./ImageUpload";
import Combobox from "../ui/combobox";

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    image: '',
    category: '',
    supplier: '',
    description: '',
    stock: ''
  });

  const categories = ["Beverages", "Food", "Desserts"]; // You can make this dynamic
  const suppliers = ["ABC Foods", "XYZ Beverages", "Fresh Farms"]; // This could be fetched from API

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price,
        image: product.image,
        category: product.category,
        supplier: product.supplier,
        description: product.description || '',
        stock: product.stock
      });
    } else {
      // Generate SKU for new products
      const randomSKU = `SKU${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, sku: randomSKU }));
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUpload
        value={formData.image}
        onChange={(path) => setFormData(prev => ({ ...prev, image: path }))}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-gray-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-gray-200"
            required
            readOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <Combobox
            value={formData.category}
            onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            options={categories}
            placeholder="Enter category name"
            createNew={true}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Supplier</label>
          <Combobox
            value={formData.supplier}
            onChange={(value) => setFormData(prev => ({ ...prev, supplier: value }))}
            options={suppliers}
            placeholder="Enter supplier name"
            createNew={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Price (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-gray-200"
              min="0"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-gray-200"
            min="0"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-gray-200 resize-none"
          rows="3"
          placeholder="Enter product description..."
        />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 