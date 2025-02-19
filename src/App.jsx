/* eslint-disable react/prop-types */
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Inventory from "./pages/Inventory";
import Transactions from "./pages/Transaction";
import Cashier from "./pages/Cashier";
import Voucher from "./pages/Voucher";
import Products from "./pages/Products";
import { CartProvider } from './contexts/CartContext';
import { Toaster } from 'react-hot-toast';

const MainContent = ({ isDrawerOpen, setIsDrawerOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const handleMenuClick = () => setIsDrawerOpen(true);
  const handleSearchChange = (value) => setSearchQuery(value);

  return (
    <div className="flex-1 flex">
      <div className="flex-1 flex flex-col">
        {location.pathname !== "/" && (
          <div className="px-8 py-6 bg-white">
            <Header
              onMenuClick={handleMenuClick}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
          </div>
        )}
        <div className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <Cashier
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  onMenuClick={handleMenuClick}
                />
              }
            />
            <Route 
              path="/inventory" 
              element={
                <div className="px-8 py-6">
                  <Inventory searchQuery={searchQuery} />
                </div>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <div className="px-8 py-6">
                  <Transactions searchQuery={searchQuery} />
                </div>
              } 
            />
            <Route 
              path="/vouchers" 
              element={
                <div className="px-8 py-6">
                  <Voucher searchQuery={searchQuery} />
                </div>
              } 
            />
            <Route path="/products" element={<Products />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <CartProvider>
      <Router>
        <div className="flex h-screen bg-[#f6f6f6]">
          <Sidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
          <MainContent 
            isDrawerOpen={isDrawerOpen} 
            setIsDrawerOpen={setIsDrawerOpen} 
          />
        </div>
      </Router>
      <Toaster position="top-right" />
    </CartProvider>
  );
};

export default App;
