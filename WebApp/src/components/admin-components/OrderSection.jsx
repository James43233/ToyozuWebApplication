"use client";

import { useEffect, useState } from "react";
import axios from "axios";

function OrdersSection() {
    const [orders, setOrders] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);

    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

    // Fetch orders
    const fetchOrders = async () => {
        try {
        setLoading(true);
        const [ordersRes, statusesRes] = await Promise.all([
            axios.get(`${apiBase}/api/deliveries/`),
            axios.get(`${apiBase}/api/delivery-statuses/`),
        ]);
        setOrders(ordersRes.data);
        setStatuses(statusesRes.data);
        setError(null);
        } catch (err) {
        console.error(err);
        setError("Failed to load data.");
        } finally {
        setLoading(false);
        }
    };

    // Handle status change
    const handleStatusChange = async (deliveryId, newStatus) => {
        try {
        setUpdating(deliveryId);
        await axios.patch(`${apiBase}/api/deliveries/${deliveryId}/`, {
            status: newStatus,
        });
        setOrders((prev) =>
            prev.map((order) =>
            order.delivery_id === deliveryId
                ? { ...order, status: newStatus }
                : order
            )
        );
        } catch (err) {
        console.error(err);
        alert("Failed to update status");
        } finally {
        setUpdating(null);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter sequential options
    const getSequentialOptions = (currentStatus) => {
        const currentIndex = statuses.findIndex(
        (s) => s.status_id === currentStatus
        );
        return statuses.slice(currentIndex); // Only allow current or forward
    };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.delivery_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{order.delivery_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.tracking_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₱{order.overall_total?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <select
                            value={order.status}
                            disabled={updating === order.delivery_id}
                            onChange={(e) =>
                            handleStatusChange(order.delivery_id, e.target.value)
                            }
                        >
                            {getSequentialOptions(order.status).map((s) => (
                            <option key={s.status_id} value={s.status_id}>
                                {s.status_name}
                            </option>
                            ))}
                        </select>                    
                
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersSection;
