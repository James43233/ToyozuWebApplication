

import { useEffect, useState } from "react";
import axios from "axios";
import ShoppingCartHeader from "../../components/ShoppingCartHeader";
import { useNavigate } from "react-router-dom";

export default function CartDemo() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const userId = localStorage.getItem("user_id");

  

  // ✅ Fetch cart items once
  useEffect(() => {
    if (!userId) {
      console.warn("No user logged in, skipping cart fetch");
      return;
    }

    axios
      .get(`http://localhost:8000/api/cart/?user=${userId}`)
      .then((res) => {
        setCartItems(res.data);
        const initSelected = {};
        const initQuantities = {};
        res.data.forEach((item) => {
          initSelected[item.product] = true;
          initQuantities[item.product] = item.quantity;
        });
        setSelectedItems(initSelected);
        setQuantities(initQuantities);
      })
      .catch((err) => console.error("Failed to fetch cart:", err));
  }, [userId]);

  // ✅ Selection and Quantity Controls
  const toggleSelection = (productId) =>
    setSelectedItems((prev) => ({ ...prev, [productId]: !prev[productId] }));

  const updateQuantity = (productId, change) =>
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, prev[productId] + change),
    }));

  const toggleSelectAll = () => {
    const allSelected = cartItems.every((item) => selectedItems[item.product]);
    const newSelection = {};
    cartItems.forEach((item) => {
      newSelection[item.product] = !allSelected;
    });
    setSelectedItems(newSelection);
  };

  const handleDelete = (productId) => {
    if (!window.confirm("Remove this item?")) return;
    axios
      .delete(`http://localhost:8000/api/cart/${productId}/`)
      .then(() => {
        setCartItems((prev) => prev.filter((item) => item.product !== productId));
      })
      .catch((err) => console.error("Failed to delete:", err));
  };

  const handleDeleteSelected = () => {
    const selectedProducts = cartItems
      .filter((item) => selectedItems[item.product])
      .map((item) => item.product);

    if (selectedProducts.length === 0) return;
    if (!window.confirm("Delete selected items?")) return;

    selectedProducts.forEach((productId) => handleDelete(productId));
  };

  // ✅ Total Computation
  const selectedTotal = cartItems
    .filter((item) => selectedItems[item.product])
    .reduce(
      (sum, item) => sum + item.selling_price * (quantities[item.product] || 1),
      0
    );

  const handleProceedToCheckout = () => {
    if (!userId) {
      alert("Please log in first.");
      return;
    }

    const items = cartItems
      .filter((item) => selectedItems[item.product])
      .map((item) => ({
        // include the fields checkout expects:
        product: item.product,                         // product id
        product_name: item.product_name,
        product_image: item.product_image,
        brand_name: item.brand_name,
        category_name: item.category_name,
        selling_price: parseFloat(item.selling_price),
        quantity: quantities[item.product] ?? item.quantity,
        // keep price if you used price_at_addition separately:
        price: parseFloat(item.price_at_addition ?? item.selling_price)
      }));

    if (items.length === 0) {
      alert("Select at least one item to checkout.");
      return;
    }

    const checkoutData = {
      user: userId,
      items,
      subtotal: items.reduce((s, it) => s + (it.selling_price * it.quantity), 0),
      total: items.reduce((s, it) => s + (it.selling_price * it.quantity), 0)
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    navigate("/CheckOutPage");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <ShoppingCartHeader />

      <div className="max-w-7xl mx-auto px-4 pb-12 mt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Products{" "}
            <span className="text-red-500">
              ({cartItems.length > 0 ? cartItems.length : 0})
            </span>
          </h1>

          <select
            className="mt-3 sm:mt-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
            defaultValue="default"
          >
            <option value="default">Sort by</option>
            <option value="name">Name</option>
            <option value="priceLowHigh">Price: Low → High</option>
            <option value="priceHighLow">Price: High → Low</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
            {/* Header Row */}
            <div className="hidden sm:grid grid-cols-6 font-semibold text-gray-700 border-b px-6 py-3 text-sm uppercase tracking-wide">
              <div className="col-span-2">Product</div>
              <div>Category / Brand</div>
              <div>Price</div>
              <div>Quantity</div>
              <div className="text-right">Subtotal</div>
            </div>

            {/* Items */}
            <div className="divide-y">
              {cartItems.map((item) => {
                const imageSrc =
                  item.product_image ||
                  item.product?.images?.[0]?.image ||
                  item.product?.images?.[0]?.url ||
                  "/placeholder.svg";

                const quantity = quantities[item.product] || item.quantity || 1;
                const subtotal = (Number(item.selling_price) * quantity).toFixed(
                  2
                );

                return (
                  <div
                    key={item.product}
                    className="grid grid-cols-1 sm:grid-cols-6 items-center gap-4 p-4 sm:px-6 hover:bg-gray-50 transition"
                  >
                    {/* Product */}
                    <div className="col-span-2 flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems[item.product]}
                        onChange={() => toggleSelection(item.product)}
                        className="w-4 h-4 text-red-600"
                      />
                      <img
                        src={imageSrc}
                        alt={item.product_name || "Product image"}
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {item.product_name}
                        </h3>
                        <button
                          onClick={() => handleDelete(item.product)}
                          className="text-xs text-red-500 hover:underline mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700">
                      {item.category_name || "Category"} › {item.brand_name}
                    </div>

                    <div className="text-gray-900 font-medium text-center sm:text-left">
                      ₱{Number(item.selling_price).toFixed(2)}
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <button
                        onClick={() => updateQuantity(item.product, -1)}
                        className="w-8 h-8 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product, 1)}
                        className="w-8 h-8 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right font-semibold text-[#eb0505]">
                      ₱{subtotal}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Controls */}
            <div className="flex items-center gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <input
                type="checkbox"
                checked={
                  cartItems.length > 0 &&
                  cartItems.every((item) => selectedItems[item.product])
                }
                onChange={toggleSelectAll}
                className="w-5 h-5 text-red-600"
              />
              <span className="text-sm text-gray-700 font-medium">Select All</span>

              <button
                onClick={handleDeleteSelected}
                disabled={
                  Object.values(selectedItems).filter(Boolean).length === 0
                }
                className="ml-2 px-4 py-2 text-sm rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                🗑️ Delete Selected
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Order Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Subtotal ({Object.values(selectedItems).filter(Boolean).length}{" "}
                    items)
                  </span>
                  <span>₱{selectedTotal.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total Payable</span>
                  <span className="text-[#eb0505]">
                    ₱{selectedTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-[#eb0505] text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
