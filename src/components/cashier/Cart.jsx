import { ShoppingCart, X, Plus, Minus, Tag, Trash2, Receipt, Ticket, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { formatToRupiah } from "../../utils/formatters";
import { orderAPI } from '../../services/api';
import { voucherAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, clearCart, total, addToCart } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [totalPaid, setTotalPaid] = useState("");
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (item, change) => {
    if (change > 0) {
      addToCart(item);
    } else {
      removeFromCart(item.id);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    if (discountCode.toLowerCase() === 'welcome10') {
      setDiscount(10);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;

    setIsApplyingVoucher(true);
    setVoucherError("");

    try {
      const response = await voucherAPI.validate(voucherCode);
      
      if (response.valid) {
        setVoucherDiscount(response.discount_percentage);
        setVoucherError("");
      } else {
        setVoucherDiscount(0);
        setVoucherError(response.message || "Invalid voucher code");
      }
    } catch (error) {
      console.error('Voucher error:', error);
      setVoucherDiscount(0);
      setVoucherError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to apply voucher"
      );
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const voucherDiscountAmount = (voucherDiscount / 100) * subtotal;
  const finalTotal = subtotal - voucherDiscountAmount;
  const change = totalPaid ? parseFloat(totalPaid) - finalTotal : 0;

  const handleCheckout = async () => {
    if (!totalPaid || parseFloat(totalPaid) < finalTotal) {
      return;
    }

    try {
      setIsCheckingOut(true);
      const orderData = {
        items: cart,
        totalAmount: finalTotal,
        discountAmount: voucherDiscountAmount,
        voucherCode: voucherCode || null,
        totalPaid: parseFloat(totalPaid),
      };

      const response = await orderAPI.create(orderData);
      clearCart();
      navigate(`/transactions`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Failed to checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm w-[25rem]">
      {/* Cart Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold">Cart</h2>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto py-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
            <ShoppingCart className="w-12 h-12 text-gray-300" />
            <p>Cart is empty</p>
          </div>
        ) : (
          <div className="px-6 space-y-3">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{formatToRupiah(item.price)}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatToRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.quantity)}
                      className="p-1.5 text-red-500 hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Section */}
      <div className="p-6 bg-gray-50 mt-auto rounded-b-xl space-y-6">
        {/* Voucher Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Ticket className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter voucher code"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <button 
              onClick={handleApplyVoucher}
              disabled={!voucherCode || isApplyingVoucher}
              className={`px-4 py-2 bg-gray-900 text-white rounded-xl transition-colors
                ${(!voucherCode || isApplyingVoucher) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-800'
                }`}
            >
              {isApplyingVoucher ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {voucherError && (
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{voucherError}</span>
            </div>
          )}
          {voucherDiscount > 0 && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <Tag className="w-4 h-4" />
              <span>Voucher applied: {voucherDiscount}% off</span>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Subtotal
            </span>
            <span>{formatToRupiah(subtotal)}</span>
          </div>
          {voucherDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Discount ({voucherDiscount}%)
              </span>
              <span>-{formatToRupiah(voucherDiscountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{formatToRupiah(finalTotal)}</span>
          </div>

          {/* Payment Input */}
          <div className="pt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount Paid
            </label>
            <input
              type="number"
              value={totalPaid}
              onChange={(e) => setTotalPaid(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent"
              placeholder="Enter amount paid"
            />
          </div>

          {/* Change Display */}
          {totalPaid && parseFloat(totalPaid) >= finalTotal && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Change</span>
              <span>{formatToRupiah(change)}</span>
            </div>
          )}

          {/* Error message if paid amount is insufficient */}
          {totalPaid && parseFloat(totalPaid) < finalTotal && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Insufficient payment amount
            </p>
          )}
        </div>

        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || isCheckingOut || !totalPaid || parseFloat(totalPaid) < finalTotal}
          className={`w-full py-3 bg-gray-900 text-white rounded-xl 
            transition-colors font-medium flex items-center justify-center gap-2
            ${(cart.length === 0 || isCheckingOut || !totalPaid || parseFloat(totalPaid) < finalTotal)
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-800'
            }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {isCheckingOut ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart; 