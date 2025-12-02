import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const OrderHistory = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusSteps = ["Pending", "Processing", "In Transit", "Delivered"];

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/delivery/user/${userId}/`
        );
        setOrders(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <select className="px-3 py-2 border rounded-lg bg-background text-sm">
            <option>All Orders</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>In Transit</option>
            <option>Delivered</option>
          </select>
          <input
            type="text"
            placeholder="Search orders..."
            className="px-3 py-2 border rounded-lg bg-background text-sm"
          />
        </div>
      </div>

      {/* Loading / Error States */}
      {loading && <p className="text-center text-gray-500">Loading orders...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Orders List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
          <div className="max-h-[28rem] overflow-y-auto">
            {orders.length > 0 ? (
              orders.map((order) => {
                const orderId = order.delivery_id || order.id;
                const orderStatus = order.status_name || order.status || "Pending";
                const orderDate = order.date || "N/A";
                const orderTotal = order.overall_total || order.total || 0;
                const orderItems = order.items || [];

                return (
                  <div key={orderId} className="border-b last:border-b-0">
                    {/* Summary Row */}
                    <div
                      className="flex items-center p-4 justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        setExpandedOrder(expandedOrder === orderId ? null : orderId)
                      }
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium">Order #{orderId}</p>
                          <p className="text-sm text-gray-500">{orderDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-semibold text-gray-900">
                            ₱{orderTotal.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Items</p>
                          <p className="font-semibold">{orderItems.length} items</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              orderStatus === "Delivered"
                                ? "bg-green-100 text-green-700"
                                : orderStatus === "In Transit"
                                ? "bg-blue-100 text-blue-700"
                                : orderStatus === "Processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {orderStatus}
                          </span>
                        </div>
                        {/* Status Timeline */}
                        <div>
                          <h4 className="font-semibold mb-2">Order Progress:</h4>
                          <div className="flex items-center justify-between">
                            {statusSteps.map((step, index) => {
                              const isActive =
                                statusSteps.indexOf(orderStatus) >= index;
                              return (
                                <div key={step} className="flex items-center flex-1">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isActive
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-300 text-gray-700"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                  {index < statusSteps.length - 1 && (
                                    <div
                                      className={`flex-1 h-1 ${
                                        isActive ? "bg-red-600" : "bg-gray-300"
                                      }`}
                                    ></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            {statusSteps.map((s) => (
                              <span key={s}>{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Order Details */}
                    {expandedOrder === orderId && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="bg-gray-50 border-t p-4 space-y-4"
                      >
                        {/* Product List */}
                        <div>
                          <h4 className="font-semibold mb-2">Products Ordered:</h4>
                          {orderItems.length > 0 ? (
                            <ul className="text-sm text-gray-700 space-y-1">
                              {orderItems.map((item, index) => (
                                <li
                                  key={index}
                                  className="flex justify-between border-b border-gray-200 py-1"
                                >
                                  <span>
                                    {item.product_name} x {item.quantity}
                                  </span>
                                  <span>₱{item.sub_total || item.price}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No items found for this order.
                            </p>
                          )}
                        </div>

                        {/* Delivery Info */}
                        <div>
                          <h4 className="font-semibold mb-2">Delivery Details:</h4>
                          <p className="text-sm text-gray-700">
                            <strong>Courier:</strong> {order.courier_name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Tracking #:</strong>{" "}
                            {order.tracking_number || "Not yet assigned"}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Address:</strong> {order.address_text || "N/A"}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center py-6 text-gray-500">No orders found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
