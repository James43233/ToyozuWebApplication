import { useEffect, useState } from "react";
import axios from "axios";

export default function InventorySection() {
  const [products, setProducts] = useState([]);
  const [recentSupplies, setRecentSupplies] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const [productsRes, suppliesRes] = await Promise.all([
          axios.get("http://localhost:8000/api/products/"),
          axios.get("http://localhost:8000/api/supply-receipts/"),
        ]);

        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setRecentSupplies(
          Array.isArray(suppliesRes.data) ? suppliesRes.data.slice(0, 5) : []
        );

        setLoading(false);
      } catch (error) {
        console.error("❌ Error loading inventory:", error);
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  // Dashboard numbers
  const lowStockCount = products.filter((p) => p.quantity <= 5).length;
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.purchase_price) * Number(p.quantity),
    0
  );

  if (loading) {
    return <p className="text-center text-gray-600">Loading inventory...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h2>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Low Stock */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Low Stock Alert</h3>
          <p className="text-3xl font-bold text-red-500">{lowStockCount}</p>
          <p className="text-sm text-gray-600">Items need restocking</p>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
          <p className="text-sm text-gray-600">Products in inventory</p>
        </div>

        {/* Inventory Value */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Value</h3>
          <p className="text-3xl font-bold text-gray-900">
            ₱{totalValue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total stock value</p>
        </div>
      </div>

      {/* Recent Supply Receipts */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Supply Transactions</h3>

        <div className="space-y-3">
          {recentSupplies.map((supply) => (
            <div key={supply.supply_id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-bold text-gray-900">Receipt #{supply.receipt_number}</p>
                <p className="text-xs text-gray-600">{supply.supplier}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">₱{Number(supply.total_cost).toLocaleString()}</p>
                <p className="text-xs text-gray-500">{supply.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Overview</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase font-semibold border-b text-gray-600">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Brand</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Qty</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.product_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-2">{p.brand_name}</td>
                  <td className="px-4 py-2">{p.category_name}</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">
                    ₱{Number(p.selling_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{p.quantity}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
