import { useCart } from '../contexts/CartContext';
import { formatToRupiah } from '../utils/formatters';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {formatToRupiah(product.price)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${
            isOutOfStock ? 'text-red-600' : 'text-green-600'
          }`}>
            {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`px-4 py-2 rounded-lg ${
              isOutOfStock 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gray-900 hover:bg-gray-800'
            } text-white text-sm font-medium transition-colors`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 