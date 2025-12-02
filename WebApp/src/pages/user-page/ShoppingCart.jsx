"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AddToCart({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const userId = localStorage.getItem("user_id"); // adjust to match your login logic

  useEffect(() => {
    if (!userId) {
      console.warn("No user logged in, skipping cart fetch");
      return;
    }

    axios
      .get(`http://localhost:8000/api/cart/?user=${userId}`)
      .then((res) => setCartItems(res.data))
      .catch((err) => console.error("Failed to fetch cart:", err));
  }, [userId]);

  const totalPrice = (product.selling_price * quantity).toFixed(2);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }

    setIsAdding(true);
    try {
      await axios.post("http://localhost:8000/api/cart/", {
        user: parseInt(userId, 10),
        product: product.product_id,
        quantity,
        price_at_addition: product.selling_price,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error.message);
      alert("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-sm shadow-lg relative">
      {/* Success Message */}
      {showSuccess && (
        <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-4 py-2 rounded-md text-sm font-semibold z-10 animate-fade-in">
          Added to cart!
        </div>
      )}

      {/* Product Info */}
      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-700 mb-2 font-serif">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{product.description}</p>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-base font-semibold text-gray-700">Quantity:</span>
        <div className="flex items-center bg-red-50 rounded-lg p-1">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className={`w-8 h-8 rounded-md border-none text-lg font-semibold flex items-center justify-center transition-colors ${
              quantity <= 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#eb0505] text-white hover:bg-red-700"
            }`}
          >
            -
          </button>

          <span className="min-w-10 text-center text-base font-semibold text-gray-700">{quantity}</span>

          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= product.quantity}
            className={`w-8 h-8 rounded-md border-none text-lg font-semibold flex items-center justify-center transition-colors ${
              quantity >= product.quantity
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#eb0505] text-white hover:bg-red-700"
            }`}
          >
            +
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex justify-between items-center mb-6 p-4 bg-red-50 rounded-lg">
        <span className="text-base text-gray-700">Total Price:</span>
        <span className="text-2xl font-bold text-[#eb0505] font-serif">₱{totalPrice}</span>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`w-full p-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
          isAdding
            ? "bg-red-400 text-white cursor-not-allowed"
            : "bg-[#eb0505] text-white hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-xl"
        }`}
      >
        {isAdding ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Adding...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
