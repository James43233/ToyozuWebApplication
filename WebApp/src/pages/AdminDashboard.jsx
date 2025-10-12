"use client"

import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import WebHeader from "../WebHeader"
import axios from "axios";
import UploadForm from "../components/UploadForm";
import ProductTable from "../components/ProductTable";
import OrderSection from "../components/OrderSection";

// Map numeric role_Id → permissions
const ROLE_PERMISSIONS = {
  1: ["VIEW_ANALYTICS", "VIEW_ORDERS", "MANAGE_PRODUCTS", "MANAGE_INVENTORY", "MANAGE_EMPLOYEES", "EDIT_PROFILE"], // Admin
  2: ["VIEW_ANALYTICS", "VIEW_ORDERS", "MANAGE_PRODUCTS", "MANAGE_INVENTORY", "EDIT_PROFILE"], // Secretary
  3: ["MANAGE_PRODUCTS", "MANAGE_INVENTORY", "EDIT_PROFILE"], // Employee
  4: ["VIEW_ORDERS", "EDIT_PROFILE"], // Customer
}

function hasPermission(roleType, permission) {
  return ROLE_PERMISSIONS[roleType]?.includes(permission) || false
}

export default function AdminDashboard() {
  const [roleType, setRoleType] = useState(null)
  const [activeSection, setActiveSection] = useState("overview")

  useEffect(() => {
    const storedRole = localStorage.getItem("role_id"); // ✅ consistent
    if (storedRole) {
      setRoleType(parseInt(storedRole, 10));
    }
  }, []);



  if (roleType !== 1) {
    return <Navigate to="/AdminDashboard" replace />;
  }

  if (roleType === null) {
    return <div>Loading...</div>;
  }

  if (roleType !== 1) {
    return <Navigate to="/unauthorized" replace />;
  }



  const navigationItems = [
    { id: "overview", label: "Overview", icon: "📊", permission: "VIEW_ANALYTICS" },
    { id: "orders", label: "Order Management", icon: "📦", permission: "VIEW_ORDERS" },
    { id: "products", label: "Product Management", icon: "🔧", permission: "MANAGE_PRODUCTS" },
    { id: "inventory", label: "Inventory", icon: "📋", permission: "MANAGE_INVENTORY" },
    { id: "employees", label: "Employee Management", icon: "👥", permission: "MANAGE_EMPLOYEES" },
    { id: "profile", label: "Profile Settings", icon: "⚙️", permission: "EDIT_PROFILE" },
  ]

  const filteredNavigation = navigationItems.filter((item) =>
    hasPermission(roleType, item.permission)
  )

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <WebHeader />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {filteredNavigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "orders" && <OrderSection />}
          {activeSection === "products" && <ProductsSection />}
          {activeSection === "inventory" && <InventorySection />}
          {activeSection === "employees" && <EmployeesSection />}
          {activeSection === "profile" && <ProfileSection roleType={roleType} />}
        </main>
      </div>
    </div>
  )
}

function ProductsSection() {
  const [suppliers, setSuppliers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const token = localStorage.getItem("access_token");

  const [showAddForm, setShowAddForm] = useState(false);
  const [receiptData, setReceiptData] = useState({
    receiptNumber: `RCP-${Date.now().toString().slice(-6)}`,
    supplierId: "",
    date: new Date().toISOString().split("T")[0],
    items: [
      {
        productName: "",
        brandId: "",
        categoryId: "",
        conditionId: "",
        purchase_price: "",
        selling_price: "",
        quantity: "",
        subtotal: 0,
        files: [],
      },
    ],
  });

  // -----------------------------
  // Helpers
  // -----------------------------
  const addProductLine = () => {
    setReceiptData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productName: "",
          brandId: "",
          categoryId: "",
          conditionId: "",
          purchase_price: "",
          selling_price: "",
          quantity: "",
          subtotal: 0,
          files: [],
        },
      ],
    }));
  };

  const removeProductLine = (index) => {
    setReceiptData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateProductLine = (index, field, value) => {
    setReceiptData((prev) => {
      const newItems = [...prev.items];
      if (["brandId", "categoryId", "conditionId"].includes(field)) {
        newItems[index][field] = value; // always string!
      } else if (["purchase_price", "selling_price"].includes(field)) {
        newItems[index][field] = value ? value : "";
      } else if (field === "files") {
        newItems[index][field] = value;
      } else {
        newItems[index][field] = value;
      }
      // Auto-calc subtotal
      const unitPrice = parseFloat(newItems[index].purchase_price) || 0;
      const qty = parseInt(newItems[index].quantity) || 0;
      newItems[index].subtotal = unitPrice * qty;
      return { ...prev, items: newItems };
    });
  };

  const calculateTotal = () => {
    return receiptData.items
      .reduce((total, item) => total + (item.subtotal || 0), 0)
      .toFixed(2);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setReceiptData({
      receiptNumber: `RCP-${Date.now().toString().slice(-6)}`,
      supplierId: "",
      date: new Date().toISOString().split("T")[0],
      items: [
        {
          productName: "",
          brandId: "",
          categoryId: "",
          conditionId: "",
          purchase_price: "",
          selling_price: "",
          quantity: "",
          subtotal: 0,
          files: [],
        },
      ],
    });
  };

  // -----------------------------
  // API Calls
  // -----------------------------
  useEffect(() => {
    if (showAddForm) {
      axios
        .get("http://localhost:8000/api/suppliers/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setSuppliers(res.data));

      axios
        .get("http://localhost:8000/api/brands/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setBrands(res.data));

      axios
        .get("http://localhost:8000/api/categories/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setCategories(res.data));

      axios
        .get("http://localhost:8000/api/conditions/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setConditions(res.data));
    }
  }, [showAddForm, token]);

  // -----------------------------
  // Confirm Receipt Flow
  const handleConfirmReceipt = async (e) => {
    e.preventDefault();

    try {
      for (const item of receiptData.items) {
        const productData = {
          name: item.productName,
          brand_id: item.brandId ? parseInt(item.brandId, 10) : null,
          category_id: item.categoryId ? parseInt(item.categoryId, 10) : null,
          condition_id: item.conditionId ? parseInt(item.conditionId, 10) : null,
          purchase_price: item.purchase_price ? parseFloat(item.purchase_price) : null,
          selling_price: item.selling_price ? parseFloat(item.selling_price) : null,
          quantity: item.quantity ? parseInt(item.quantity, 10) : 0,
        };

        console.log("DEBUG: Access token:", token);
        console.log("DEBUG: Supplier list:", suppliers);
        console.log("DEBUG: Receipt Data:", receiptData);

        const productRes = await axios.post(
          "http://localhost:8000/api/products/",
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const productId = productRes.data.product_id;


        if (item.files && item.files.length > 0) {
          const formData = new FormData();
          Array.from(item.files).forEach((file) =>
            formData.append("images", file)
          );
          await axios.post(
            `http://localhost:8000/api/products/${productId}/upload-images/`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
      }

      // ---- THIS BLOCK IS THE FIX ----
      // Find the supplier name from supplierId
      const supplierName =
        suppliers.find(s => String(s.supplier_id) === receiptData.supplierId)?.name || "";

      // Build items array with unitPrice
      const items = receiptData.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.purchase_price, // Backend expects unitPrice!
      }));

      // Build payload for receipt
      const receiptPayload = {
        receiptNumber: receiptData.receiptNumber,
        supplierName, // Backend expects supplierName!
        date: receiptData.date,
        items,
      };

      console.log("Receipt payload:", receiptPayload); // Debug

      await axios.post(
        "http://localhost:8000/api/supply-receipts/",
        receiptPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Product(s), images, and receipt saved.");
      resetForm();
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err.message);
    }
  };
  // -----------------------------
  // Add Supplier / Brand / Category
  // -----------------------------
  const handleAddSupplier = () => {
    const name = prompt("Enter supplier name:");
    if (!name) return;

    const contact = prompt("Enter contact number:");
    if (!contact) return;

    const address = prompt("Enter address:");
    if (!address) return;

    axios
      .post(
        "http://localhost:8000/api/suppliers/",
        { name, contact_number: contact, address },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        axios
          .get("http://localhost:8000/api/suppliers/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setSuppliers(res.data));
      });
  };

  const handleAddBrand = () => {
    const name = prompt("Enter brand name:");
    if (!name) return;

    const description = prompt("Enter brand description (optional):");

    axios
      .post(
        "http://localhost:8000/api/brands/",
        { name, description: description || null },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() =>
        axios
          .get("http://localhost:8000/api/brands/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setBrands(res.data))
      );
  };

  const handleAddCategory = () => {
    const name = prompt("Enter category name:");
    if (!name) return;

    const description = prompt("Enter category description (optional):");

    axios
      .post(
        "http://localhost:8000/api/categories/",
        { name, description: description || null },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() =>
        axios
          .get("http://localhost:8000/api/categories/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setCategories(res.data))
      );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Add Product
        </button>
      </div>
      {showAddForm && (
        <div className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg max-w-8xl mx-auto">
          {/* Receipt Header */}
          <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">SUPPLIER RECEIPT</h3>
            <p className="text-sm text-gray-600">Product Inventory Form</p>
          </div>

          <form onSubmit={handleConfirmReceipt} className="space-y-6">
            {/* Receipt Info */}
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Receipt Number</label>
                <input
                  type="text"
                  value={receiptData.receiptNumber}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 font-mono"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Supplier</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={receiptData.supplierId}
                    onChange={(e) => setReceiptData({ ...receiptData, supplierId: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.supplier_id} value={String(s.supplier_id)}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSupplier}
                    className="text-red-600 hover:text-red-700 text-lg font-bold px-2"
                    title="Add Supplier"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Date</label>
                <input
                  type="date"
                  value={receiptData.date}
                  onChange={(e) => setReceiptData({ ...receiptData, date: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>
            {/* Product Lines */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900 uppercase">Product Details</h4>
                <button
                  type="button"
                  onClick={addProductLine}
                  className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                >
                  + Add Product Line
                </button>
              </div>
              {/* Table Header */}
              <div className="grid grid-cols-16 gap-2 text-xs font-semibold text-gray-700 uppercase border-b border-gray-300 pb-2">
                <div className="col-span-3">Product Name</div>
                <div className="col-span-2">Brand</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Condition</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">Selling Price</div>
                <div className="col-span-1">Quantity</div>
                <div className="col-span-1">Subtotal</div>
                <div className="col-span-1"></div>
              </div>
              {/* Product Rows */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {receiptData.items.map((item, index) => (
                  <div key={index} className="space-y-2 border-b pb-4">
                    <div className="grid grid-cols-16 gap-4 items-center">
                      {/* Product Name */}
                      <input
                        type="text"
                        placeholder="Product name"
                        value={item.productName}
                        onChange={(e) => updateProductLine(index, "productName", e.target.value)}
                        className="col-span-3 border rounded px-2 py-2 text-sm"
                        required
                      />
                      {/* Brand */}
                      <div className="col-span-2 flex items-center space-x-2">
                        {console.log("Brands array:", brands)}
                        <select
                          value={item.brandId}
                          onChange={e => {
                            console.log(`Brand select changed for item ${index} :`, e.target.value);
                            updateProductLine(index, "brandId", e.target.value);
                          }}
                        >
                          <option value="">Select Brand</option>
                          {brands.map((b, i) => {
                            // Try id, then brand_id, then fallback to index
                            const id = b.id ?? b.brand_id ?? `brand-${i}`;
                            return (
                              <option key={id} value={String(id)}>
                                {b.name || `Brand #${i}`}
                              </option>
                            );
                          })}
                        </select>
                        <button
                          type="button"
                          onClick={handleAddBrand}
                          className="text-red-600 hover:text-red-700 text-lg font-bold px-2"
                        >
                          +
                        </button>
                      </div>
                      {/* Category */}
                      <div className="col-span-2 flex items-center space-x-1">
                        <select
                          value={item.categoryId}
                          onChange={e => {
                            console.log(`Category select changed for item ${index} :`, e.target.value);
                            updateProductLine(index, "categoryId", e.target.value);
                          }}
                        >
                          <option value="">Select Category</option>
                          {categories.map((c, i) => (
                            <option
                              key={c.category_id ? String(c.category_id) : `cat-${i}`}
                              value={c.category_id ? String(c.category_id) : ""}
                            >
                              {c.name || `Category #${i}`}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="text-red-600 hover:text-red-700 text-lg font-bold px-2"
                        >
                          +
                        </button>
                      </div>
                      {/* Condition */}
                      <div className="col-span-2">
                        <select
                          value={item.conditionId}
                          onChange={e => {
                            console.log(`Condition select changed for item ${index} :`, e.target.value);
                            updateProductLine(index, "conditionId", e.target.value);
                          }}
                        >
                          <option value="">Select Condition</option>
                          {conditions.map((cond, i) => (
                            <option
                              key={cond.condition_id ? String(cond.condition_id) : `cond-${i}`}
                              value={cond.condition_id ? String(cond.condition_id) : ""}
                            >
                              {cond.name || `Condition #${i}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Purchase Price */}
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Purchase Price"
                        value={item.purchase_price}
                        onChange={(e) => updateProductLine(index, "purchase_price", e.target.value)}
                        className="col-span-2 border rounded px-2 py-2 text-sm"
                        required
                      />
                      {/* Selling Price */}
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Selling Price"
                        value={item.selling_price}
                        onChange={(e) => updateProductLine(index, "selling_price", e.target.value)}
                        className="col-span-2 border rounded px-2 py-2 text-sm"
                        required
                      />
                      {/* Quantity */}
                      <input
                        type="number"
                        placeholder="0"
                        value={item.quantity}
                        onChange={(e) => updateProductLine(index, "quantity", e.target.value)}
                        className="col-span-1 border rounded px-2 py-2 text-sm"
                        required
                      />
                      {/* Subtotal */}
                      <div className="col-span-1 text-sm font-semibold">
                        ₱{item.subtotal.toFixed(2)}
                      </div>
                      {/* Remove line */}
                      <div className="col-span-1 flex justify-end">
                        {receiptData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProductLine(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Upload Form */}
                    <div className="mt-2 ml-2 col-span-4">
                      <div className="text-xs font-semibold text-gray-700 uppercase mb-1">
                        Upload Photo
                      </div>
                      <UploadForm
                        files={item.files || []}
                        setFiles={(newFiles) => updateProductLine(index, "files", newFiles)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Total Section */}
            <div className="border-t-2 border-gray-300 pt-4 space-y-2">
              <div className="flex justify-end items-center">
                <span className="text-lg font-bold text-gray-900 mr-4">TOTAL:</span>
                <span className="text-2xl font-bold text-red-600">₱{calculateTotal()}</span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Confirm Receipt
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Product Table */}
      <ProductTable />
    </div>
  );
}


// Overview Section Component
function OverviewSection() {
  const stats = [
    { label: "Total Revenue", value: "$124,563", change: "+12.5%", positive: true },
    { label: "Total Orders", value: "1,247", change: "+8.2%", positive: true },
    { label: "Active Products", value: "342", change: "+5.1%", positive: true },
    { label: "Low Stock Items", value: "23", change: "-15.3%", positive: true },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`text-sm font-medium ${stat.positive ? "text-green-500" : "text-red-500"}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            "New order #1247 received - $89.99",
            'Product "Brake Pads Premium" added to inventory',
            "Low stock alert: Oil Filter Standard (5 remaining)",
            "Employee Mike Employee updated product pricing",
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span className="text-gray-900">{activity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Orders Section Component
function OrdersSection1() {
  const orders = [
    { id: "#1247", customer: "John Doe", total: "$89.99", status: "Processing", date: "2024-01-15" },
    { id: "#1246", customer: "Jane Smith", total: "$156.50", status: "Shipped", date: "2024-01-14" },
    { id: "#1245", customer: "Bob Johnson", total: "$234.75", status: "Delivered", date: "2024-01-13" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === "Processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


// Inventory Section Component
function InventorySection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Low Stock Alert</h3>
          <p className="text-3xl font-bold text-red-500">23</p>
          <p className="text-sm text-gray-600">Items need restocking</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">342</p>
          <p className="text-sm text-gray-600">In inventory</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Value</h3>
          <p className="text-3xl font-bold text-gray-900">$45,678</p>
          <p className="text-sm text-gray-600">Total stock value</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Movements</h3>
        <div className="space-y-3">
          {[
            { action: "Stock Added", product: "Brake Pads Premium", quantity: "+50", time: "2 hours ago" },
            { action: "Stock Sold", product: "Oil Filter Standard", quantity: "-15", time: "4 hours ago" },
            { action: "Stock Added", product: "Spark Plugs Set", quantity: "+25", time: "1 day ago" },
          ].map((movement, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    movement.action === "Stock Added" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{movement.action}</p>
                  <p className="text-xs text-gray-600">{movement.product}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    movement.quantity.startsWith("+") ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {movement.quantity}
                </p>
                <p className="text-xs text-gray-600">{movement.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Employees Section Component (Admin only)
function EmployeesSection() {
  const employees = [
    { id: 1, name: "John Admin", email: "admin@toyozu.com", role: "Admin", status: "Active" },
    { id: 2, name: "Sarah Secretary", email: "secretary@toyozu.com", role: "Secretary", status: "Active" },
    { id: 3, name: "Mike Employee", email: "employee@toyozu.com", role: "User Employee", status: "Active" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-red-600 hover:text-red-800 mr-3">Edit</button>
                    <button className="text-red-500 hover:text-red-400">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Profile Section Component
function ProfileSection({ currentUser }) {
  const [profile, setProfile] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: "+1 (555) 123-4567",
    department: "Administration",
  })

  const handleSave = (e) => {
    e.preventDefault()
    alert("Profile updated successfully!")
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Department</label>
              <input
                type="text"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
