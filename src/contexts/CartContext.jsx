import { createContext, useContext, useState } from 'react';
import { productAPI } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [productStocks, setProductStocks] = useState({});

  const updateLocalStock = (productId, stock, adjustment) => {
    setProductStocks(prev => ({
      ...prev,
      [productId]: (prev[productId] ?? stock) + adjustment
    }));
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const existingItem = cart.find(item => item.id === product.id);
      const currentStock = productStocks[product.id] ?? product.stock;
      const newStock = currentStock - quantity;

      if (newStock >= 0) {
        const response = await productAPI.updateStock(product.id, -quantity);
        
        if (response) {
          // Update local stock tracking
          updateLocalStock(product.id, product.stock, -quantity);

          if (existingItem) {
            setCart(cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ));
          } else {
            setCart([...cart, { ...product, quantity }]);
          }
        }
      } else {
        throw new Error('Insufficient stock');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert(error.response?.data?.error || error.message || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (productId, quantity = 1) => {
    try {
      const item = cart.find(item => item.id === productId);
      if (!item) return;

      const response = await productAPI.updateStock(productId, quantity);
      
      if (response) {
        // Update local stock tracking
        updateLocalStock(productId, item.stock, quantity);

        if (item.quantity <= quantity) {
          setCart(cart.filter(item => item.id !== productId));
        } else {
          setCart(cart.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity - quantity }
              : item
          ));
        }
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to remove from cart');
    }
  };

  const clearCart = async () => {
    try {
      await Promise.all(
        cart.map(item => productAPI.updateStock(item.id, item.quantity))
      );
      
      // Reset all stock levels
      cart.forEach(item => {
        updateLocalStock(item.id, item.stock, item.quantity);
      });
      setCart([]);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart,
      productStocks,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 