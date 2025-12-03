import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/WebHeader.jsx";
import "../../App.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Admin() {
  const [lowStock, setLowStock] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [deliveries, setDeliveries] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const [supplies, setSupplies] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    axios.get("/api/low-stock-products/").then((res) => setLowStock(res.data));
    axios.get("/api/top-selling-products/").then((res) => setTopSelling(res.data));
    axios.get("/api/recent-transactions/").then((res) => setRecentTx(res.data));
    axios
      .get(`/api/deliveries-stats/?month=${selectedMonth}`)
      .then((res) => setDeliveries(res.data));
    axios
      .get(`/api/sales-stats/?month=${selectedMonth}`)
      .then((res) => setSalesStats(res.data));
    axios
      .get(`/api/supplies-stats/?month=${selectedMonth}`)
      .then((res) => setSupplies(res.data));
    axios.get("/api/product-stats/").then((res) => setProductStats(res.data));
    axios.get("/api/customer-stats/").then((res) => setCustomerStats(res.data));
  }, [selectedMonth]);

  // Handler for navigating to Register page
  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <>
      <Header />
      
      <div className="w-[1400px] mx-auto bg-white h-[1100px] flex flex-col p-8">
              {/* Register Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={goToRegister}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to register an Employee
          </button>
        </div>
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
          <div className="bg-green-400 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl text-white mb-4">Sales Revenue</h2>
            <p>
              Total Sales:{" "}
              {salesStats && salesStats.Total_Sales
                ? salesStats.Total_Sales
                : "No data"}
              , Total Revenue:{" "}
              {salesStats && salesStats.Total_Revenue
                ? salesStats.Total_Revenue
                : "No data"}
            </p>
          </div>
          <div className="bg-red-400 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl text-white mb-4">Supplies Amount</h2>
            <p>
              Total Supplies:{" "}
              {supplies && supplies.Total_Supplies
                ? supplies.Total_Supplies
                : "No data"}
              , Total Amount:{" "}
              {supplies && supplies.Total_Supply_Cost
                ? supplies.Total_Supply_Cost
                : "No data"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-8">
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

        <div className="grid grid-cols-3 gap-2 mt-8">
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

          {/* Top Selling Products */}
          <div className="bg-teal-400 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl text-white mb-4">Top Selling Products</h2>
            <div className="overflow-y-auto max-h-48">
              <table className="w-full text-white">
                <thead>
                  <tr>
                    <th className="text-left">Product</th>
                    <th className="text-right">Sales</th>
                    <th className="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(topSelling) && topSelling.length === 0 ? (
                    <tr>
                      <td colSpan={3}>No data</td>
                    </tr>
                  ) : (
                    Array.isArray(topSelling) &&
                    topSelling.map((row, i) => (
                      <tr key={i}>
                        <td>{row.product_name}</td>
                        <td className="text-right">{row.sales_count}</td>
                        <td className="text-right">{parseFloat(row.total_revenue).toFixed(2)}</td>
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

export default Admin;