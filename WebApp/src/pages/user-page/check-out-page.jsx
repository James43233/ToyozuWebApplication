"use client"
import { useState, useEffect } from "react"
import WebHeader from "../../components/WebHeader"
import axios from "axios";

export default function CheckoutPage() {
  const [cartProducts, setCartProducts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const userId = localStorage.getItem("user_id");
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);

  // Debug: Log cartProducts every time they change
  useEffect(() => {
    console.log("[DEBUG] cartProducts updated:", cartProducts);
  }, [cartProducts]);

  useEffect(() => {
    // 1) read checkoutData passed from Cart page
    const raw = localStorage.getItem("checkoutData");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setCartProducts(data.items || []);
        console.log("[DEBUG] Loaded checkoutData items:", data.items || []);
      } catch (e) {
        console.error("Failed to parse checkoutData:", e);
      }
    } else {
      // fallback: if nothing passed, try to fetch user's cart (select all)
      (async () => {
        if (!userId) return;
        try {
          const res = await axios.get(`http://localhost:8000/api/cart?user=${userId}`);
          const mapped = res.data.map(it => ({
            product: it.product, // this is the product_id (number)
            product_name: it.product_name,
            product_image: it.product_image,
            brand_name: it.brand_name,
            category_name: it.category_name,
            selling_price: parseFloat(it.selling_price ?? it.price_at_addition ?? 0),
            quantity: it.quantity,
            price: parseFloat(it.price_at_addition ?? it.selling_price ?? 0)
          }));
          setCartProducts(mapped);
          console.log("[DEBUG] Loaded cart fallback items:", mapped);
        } catch (e) {
          console.error("Failed to fetch cart as fallback:", e);
        }
      })();
    }

    // 2) fetch addresses for user
    (async () => {
      if (!userId) return;
      try {
        const addrRes = await axios.get(`http://localhost:8000/api/addresses?user=${userId}`);
        setAddresses(addrRes.data || []);
        if ((addrRes.data || []).length > 0) {
          setSelectedAddress(addrRes.data[0].address_id ?? addrRes.data[0].id);
        }
        console.log("[DEBUG] Loaded addresses:", addrRes.data || []);
      } catch (err) {
        console.error("Error loading addresses:", err);
      }
    })();
  }, []);

  // subtotal uses selling_price (or price fallback)
  const subtotal = cartProducts.reduce((sum, p) => {
    const price = parseFloat(p.selling_price ?? p.price ?? 0);
    const qty = Number(p.quantity ?? 1);
    return sum + price * qty;
  }, 0);

  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    console.group("[DEBUG] Place Order");

    // Step 1: Log all critical data before validation
    console.log("Selected address:", selectedAddress);
    console.log("Cart products:", cartProducts);
    console.log("Selected courier:", selectedCourier);
    console.log("Payment method:", paymentMethod);
    console.log("User ID:", userId);
    console.log("Subtotal:", subtotal);
    console.log("Total:", total);

    // Step 2: Validation and early exits
    if (!selectedAddress) { 
      alert("Pick a delivery address"); 
      console.warn("No delivery address selected!");
      console.groupEnd();
      return; 
    }
    if (!cartProducts.length) { 
      alert("No items to order"); 
      console.warn("Cart is empty!");
      console.groupEnd();
      return; 
    }
    if (!selectedCourier) {
      alert("Please select a courier.");
      console.warn("No courier selected!");
      console.groupEnd();
      return;
    }

    // Step 3: Build items payload and log each item
    const itemsPayload = cartProducts.map((p, idx) => {
      const item = {
        product_id: p.product,
        quantity: p.quantity,
        price: p.price ?? p.selling_price
      };
      console.log(`Item ${idx}:`, item);
      return item;
    });

    // Step 4: Construct full payload
    const payload = {
      user: Number(userId),
      address_id: selectedAddress,
      courier: selectedCourier,
      payment_method: paymentMethod,
      items: itemsPayload,
      subtotal,
      total
    };

    console.log("Final order payload:", JSON.stringify(payload, null, 2));

    // Step 5: API call
    try {
      const res = await axios.post("http://localhost:8000/api/orders/", payload);
      console.log("Order API response:", res.data);
      localStorage.removeItem("checkoutData");
      window.location.href = "/PlaceOrder";
    } catch (err) {
      if (err.response) {
        console.error("Order failed: Response error", err.response.status, err.response.data);
      } else {
        console.error("Order failed: General error", err.message);
      }
      alert("Failed to place order.");
    }

    console.groupEnd();
  };
  // Fetch couriers from backend
  useEffect(() => {
    const fetchCouriers = async () => {
      const url = "http://localhost:8000/api/couriers/";
      console.log("🟡 [DEBUG] Fetching couriers from:", url);

      try {
        const response = await axios.get(url);
        console.log("🟢 [DEBUG] Courier response:", response);

        if (response.data && Array.isArray(response.data)) {
          setCouriers(response.data);
          console.log(`✅ [DEBUG] Loaded ${response.data.length} couriers`);
        } else {
          console.warn("⚠️ [DEBUG] Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("❌ [DEBUG] Failed to fetch couriers:", error);
        if (error.response) {
          console.error("❌ [DEBUG] Response status:", error.response.status);
          console.error("❌ [DEBUG] Response data:", error.response.data);
        } else if (error.request) {
          console.error("❌ [DEBUG] No response from server:", error.request);
        } else {
          console.error("❌ [DEBUG] Axios config error:", error.message);
        }
      }
    };

    fetchCouriers();
  }, []);

  // Calculate shipping cost when courier changes
  useEffect(() => {
    if (!selectedCourier || cartProducts.length === 0) {
      console.log("[DEBUG] Skipping shipping calculation: selectedCourier:", selectedCourier, "cartProducts:", cartProducts);
      return;
    }

    // Debug: Show each cartProduct
    console.log("[DEBUG] cartProducts before mapping:", cartProducts);
    cartProducts.forEach((p, i) => {
      console.log(`[DEBUG] cartProduct[${i}]:`, p);
    });

    // Since product is the product_id, map directly
    const productsPayload = cartProducts.map(p => ({
      product_id: p.product,
      quantity: p.quantity
    }));

    console.log("[DEBUG] productsPayload:", productsPayload);

    const payload = {
      courier_id: selectedCourier,
      products: productsPayload
    };

    console.log("[DEBUG] Shipping calculation payload:", JSON.stringify(payload, null, 2));

    axios
      .post("http://localhost:8000/api/calculate-shipping/", payload)
      .then((res) => {
        console.log("[DEBUG] Shipping cost API response:", res.data);
        setShippingCost(res.data.shipping_cost);
      })
      .catch((err) => {
        console.error("[DEBUG] Failed to calculate shipping:", err.response?.data || err.message);
      });
  }, [selectedCourier, cartProducts]);

  // Debug: Show order summary values
  useEffect(() => {
    console.log("[DEBUG] Order summary values:", {
      subtotal,
      shippingCost,
      total,
      cartProducts
    });
  }, [subtotal, shippingCost, total, cartProducts]);

  return (
    <div className="min-h-screen bg-[#fef5f5]">
      {/* Header */}
      <WebHeader />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {cartProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No items selected for checkout.</p>
                ) : (
                  cartProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 pb-4 border-b last:border-b-0"
                    >
                      <img
                        src={product.product_image || "/placeholder.svg"}
                        alt={product.product_name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {product.product_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {product.brand_name} • {product.category_name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">
                            Qty: {product.quantity}
                          </span>
                          <span className="font-bold text-red-600">
                            ₱{(parseFloat(product.price || product.selling_price) * product.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Address Selection */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Select Delivery Address</h3>
              {addresses.length === 0 ? (
                <p className="text-gray-500 text-sm">No saved addresses found.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.address_id}
                      className={`block border p-4 rounded-lg cursor-pointer transition ${
                        selectedAddress === addr.address_id
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{addr.barangay_name}</p>
                          <p className="text-sm text-gray-600">{addr.street_house_building_no}</p>
                          <p className="text-sm text-gray-600">{addr.city_municipality}, {addr.province}</p>
                        </div>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === addr.address_id}
                          onChange={() => setSelectedAddress(addr.address_id)}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Courier Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Courier</h2>
              <div className="space-y-3">
                {couriers.map((courier) => (
                  <label
                    key={courier.courier_id}
                    className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCourier === courier.courier_id
                        ? "border-red-600 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="courier"
                        value={courier.courier_id}
                        checked={selectedCourier === courier.courier_id}
                        onChange={() => setSelectedCourier(courier.courier_id)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{courier.name}</p>
                        <p className="text-sm text-gray-600">
                          Estimated delivery: {courier.delivery_time || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        ₱{Number(courier.base_rate).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        + ₱{Number(courier.rate_per_kg).toFixed(2)}/kg
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">

                {/* Cash on Delivery - always available */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === "cod" ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-red-300"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="text-red-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </div>
                </div>

                {/* Online Payment - future proof block */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      disabled // Change to enabled when ready!
                      className="text-gray-400"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Online Payment</p>
                      <p className="text-sm text-gray-600">Available soon</p>
                    </div>
                  </div>
                  {/* Future: List merchants here when online payment is available */}
                  {/*
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <img src="/gcash-logo.svg" alt="GCash" className="h-5" />
                      <span className="text-sm text-gray-700">GCash</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src="/visa-logo.svg" alt="Visa" className="h-5" />
                      <span className="text-sm text-gray-700">Visa / Mastercard / JCB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src="/bank-logo.svg" alt="Bank" className="h-5" />
                      <span className="text-sm text-gray-700">Bank Transfer</span>
                    </div>
                  </div>
                  */}
                </div>
              </div>
            </div>
          </div>
          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartProducts.length} items)</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping Fee</span>
                  <span>₱{shippingCost.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-red-600">₱{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Place Order
              </button>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  By placing this order, you agree to our Terms & Conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}