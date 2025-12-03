import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../Header.jsx";
import "../App.css";

function Dashboard() {
  const [lowStock, setLowStock] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [deliveries, setDeliveries] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    axios.get("/api/low-stock-products/").then((res) => setLowStock(Array.isArray(res.data) ? res.data : (res.data.data || [])));
    axios.get("/api/recent-transactions/").then((res) => setRecentTx(Array.isArray(res.data) ? res.data : (res.data.data || [])));
    axios
      .get(`/api/deliveries-stats/?month=${selectedMonth}`)
      .then((res) => setDeliveries(res.data));
    axios.get("/api/product-stats/").then((res) => setProductStats(res.data));
    axios.get("/api/customer-stats/").then((res) => setCustomerStats(res.data));
  }, [selectedMonth]);

  return (
    <>
      <Header />
      <div className="w-[1400px] mx-auto bg-white h-[1100px] flex flex-col p-8">
        {/* Month filter */}
        <form
          method="GET"
          className="mb-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="month" className="text-xl">
            Select Month:{" "}
          </label>
          <input
            type="month"
            id="month"
            name="month"
            className="p-2 border rounded"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </form>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-blue-400 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl text-white mb-4">Deliveries</h2>
            <p>
              Total Deliveries:{" "}
              {deliveries && deliveries.Total_deliveries
                ? deliveries.Total_deliveries
                : "No data"}
            </p>
          </div>
          <div className="bg-yellow-400 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl text-white mb-4">Product Statistics</h2>
            <p>
              Total Available Products:{" "}
              {productStats && productStats.Total_Available_Products
                ? productStats.Total_Available_Products
                : "No data"}
            </p>
          </div>
          <div className="bg-purple-400 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl text-white mb-4">Customer Statistics</h2>
            <p>
              Total Customers:{" "}
              {customerStats && customerStats.Total_Customers
                ? customerStats.Total_Customers
                : "No data"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8">
          {/* Low Stock Products */}
          <div className="bg-orange-400 p-4 rounded-lg shadow-lg">
            <h2 className="text-2xl text-white mb-4">Low Stock Alerts</h2>
            <div className="overflow-y-auto max-h-48">
              <table className="w-full text-white">
                <thead>
                  <tr>
                    <th className="text-left">Product</th>
                    <th className="text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(lowStock) && lowStock.length === 0 ? (
                    <tr>
                      <td colSpan={2}>No low stock products</td>
                    </tr>
                  ) : (
                    Array.isArray(lowStock) &&
                    lowStock.map((row) => (
                      <tr key={row.product_id}>
                        <td>{row.name}</td>
                        <td className="text-right">{row.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-indigo-400 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl text-white mb-4">Recent Transactions</h2>
            <div className="overflow-y-auto max-h-48">
              <table className="w-full text-white">
                <thead>
                  <tr>
                    <th className="text-left">Sale ID</th>
                    <th className="text-left">Customer</th>
                    <th className="text-right">Amount</th>
                    <th className="text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(recentTx) && recentTx.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No recent transactions</td>
                    </tr>
                  ) : (
                    Array.isArray(recentTx) &&
                    recentTx.map((tx) => (
                      <tr key={tx.sale_id}>
                        <td>{tx.sale_id}</td>
                        <td>{tx.customer_name}</td>
                        <td className="text-right">{tx.total_amount}</td>
                        <td className="text-right">
                          {tx.date ? new Date(tx.date).toLocaleDateString() : ""}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;