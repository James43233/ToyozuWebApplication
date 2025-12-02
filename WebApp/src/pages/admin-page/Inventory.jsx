import '../../App.css';
import Header from '../../Header.jsx';

import React, { useState, useEffect } from 'react';

function Inventory() {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newReceiptNumber, setNewReceiptNumber] = useState('');
  const [newReceiptSupplierId, setNewReceiptSupplierId] = useState('');

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [conditions, setConditions] = useState([]);


   // Form fields
  const [form, setForm] = useState({
    product_id: null,
    name: '',
    category_id: '',
    brand_id: '',
    condition_id: '',
    purchase_price: '',
    selling_price: '',
    quantity: '',
    supply_receipt: '',
    supplier_id: '',
    supply_date: '',
    description: ''
  });

   // Populate form for update
  const handleRowClick = product => {
    setForm({
      product_id: product.product_id,
      name: product.name,
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      condition_id: product.condition_id || '',
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      quantity: product.quantity,
      supply_receipt: product.supply_receipt || '',
      supplier_id: product.supplier_id || '',
      supply_date: product.supply_date || '',
      description: product.description || ''
    });
  };
  const handleStockIn = () => {
  fetch('http://localhost:8000/api/stock-in/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      product_id: selectedProductId,
      receipt_number: selectedReceiptNumber, // from Supply/receipt dropdown
      quantity: quantity,
      price: price, // batch purchase price
      condition_id: conditionId
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      alert('Stock-in successful!');
      // Optionally: refresh product list/state here
    }
  });
};



  useEffect(() => {
    // Fetch brands
    fetch('http://localhost:8000/api/brands/')
      .then(res => res.json())
      .then(setBrands);

    // Fetch categories
    fetch('http://localhost:8000/api/categories/')
      .then(res => res.json())
      .then(setCategories);

    // Fetch suppliers
    fetch('http://localhost:8000/api/suppliers/')
      .then(res => res.json())
      .then(setSuppliers);

    // Fetch products (joined table)
    fetch('http://localhost:8000/api/products/')
      .then(res => res.json())
      .then(setProducts);

    fetch('http://localhost:8000/api/supplies/')
      .then(res => res.json())
      .then(setReceipts);
    fetch('http://localhost:8000/api/conditions/')
    .then(res => res.json())
    .then(setConditions);
  }, []);
   // Helpers
  const resetForm = () => {
    setForm({
      product_id: null,
      name: '',
      category_id: '',
      brand_id: '',
      condition_id: '',
      purchase_price: '',
      selling_price: '',
      quantity: '',
      supply_receipt: '',
      supplier_id: '',
      supply_date: '',
      description: ''
    });
  };
    // CREATE or UPDATE
  const handleSave = () => {
    const method = form.product_id ? 'PUT' : 'POST';
    const url = form.product_id
      ? `http://localhost:8000/api/products/${form.product_id}/`
      : 'http://localhost:8000/api/products/';
    const body = {
      name: form.name,
      category_id: form.category_id,
      brand_id: form.brand_id,
      purchase_price: form.purchase_price,
      selling_price: form.selling_price,
      quantity: form.quantity,
      description: form.description
      // Add other fields as needed
    };
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        fetch('http://localhost:8000/api/products/')
          .then(res => res.json())
          .then(setProducts);
        resetForm();
      });
  };
   // DELETE
  const handleDelete = () => {
    if (!form.product_id) { alert('Select a product to delete.'); return; }
    setShowAdminModal(true);
    setDeleteError('');
    setAdminUsername('');
    setAdminPassword('');
  };

  // Handle input change
  const handleInputChange = e => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveReceipt = async () => {
  setReceiptError('');
  if (!newReceiptNumber || !newReceiptSupplierId) {
    setReceiptError('Please enter receipt number and select supplier.');
    return;
  }
  setIsAddingReceipt(true);
  try {
    const res = await fetch('http://localhost:8000/api/supplies/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt_number: newReceiptNumber,
        supplier: newReceiptSupplierId, // Must be a valid supplier ID
        // add other fields as needed (e.g., date, user_id)
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      setReceiptError(err.error || 'Failed to add receipt.');
      setIsAddingReceipt(false);
      return;
    }
    setShowReceiptModal(false);
    setNewReceiptNumber('');
    setNewReceiptSupplierId('');
    // REFRESH RECEIPTS
    fetch('http://localhost:8000/api/supplies/')
      .then(res => res.json())
      .then(setReceipts);
  } catch (e) {
    setReceiptError('Network or server error.');
  }
  setIsAddingReceipt(false);
};
  const confirmDelete = async () => {
    setDeleteError('');
    setDeleting(true);
    if (!adminUsername || !adminPassword) {
      setDeleteError('Admin username and password required.');
      setDeleting(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/products/${form.product_id}/admin_delete/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        // Not JSON; could be a CORS or 500 error
        setDeleteError('Server error: not a valid JSON response.');
        setDeleting(false);
        return;
      }
      if (res.ok) {
        setShowAdminModal(false);
        setAdminUsername('');
        setAdminPassword('');
        fetch('http://localhost:8000/api/products/')
          .then(res => res.json())
          .then(setProducts);
        resetForm();
      } else {
        setDeleteError(data.error || 'Delete failed.');
      }
    } catch (e) {
      setDeleteError('Network error: could not reach backend.');
    }
    setDeleting(false);
  };



  return (
    <>
      <Header />
      <div className="w-full mx-auto h-screen flex">
        <div className="flex flex-row">
          {/* Left Panel */}
          <div className="w-[500px] min-h-screen border-r border-black">
            <div className="pt-[50px] pb-[30px] flex items-center justify-center">
              <span className="text-xl text-center">Inventory System Update</span>
            </div>

            <div className="grid grid-cols-2 gap-[30px] w-[450px] mx-auto">
              {/* Product Name */}
              <div className="flex flex-col items-start">
                <label className="font-sigmar mb-2 text-lg">Product Name:</label>
                <input
                  id="name"
                  className="w-full py-2 text-center border border-gray-300 rounded-sm flex"
                  type="text"
                  placeholder="Product Name"
                  value={form.name}
                  onChange={handleInputChange}
                />
              </div>

              {/* Category */}
              <div className="flex flex-col items-start">
                <label>Category:</label>
                <select
                  id="category_id"
                  className="w-full p-2 border rounded bg-gray-100 text-black"
                  value={form.category_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <a
                  className="text-blue-700 font-mono underline mt-[5px] cursor-pointer"
                  onClick={() => setShowCategoryModal(true)}
                >
                  Add Category
                </a>
              </div>

              {/* Brand */}
              <div className="flex flex-col items-start">
                <label>Brand:</label>
                <select
                  id="brand_id"
                  className="w-full p-2 border rounded bg-gray-100 text-black"
                  value={form.brand_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Brand --</option>
                  {brands.map(brand => (
                    <option key={brand.brand_id} value={brand.brand_id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <a
                  className="text-blue-700 font-mono underline mt-[5px] cursor-pointer"
                  onClick={() => setShowBrandModal(true)}
                >
                  Add Brand
                </a>
              </div>

              {/* Condition */}
              <div className="flex flex-col items-start">
                <label>Condition:</label>
                <select
                  id="condition_id"
                  className="w-full p-2 border rounded bg-gray-100 text-black"
                  value={form.condition_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Condition --</option>
                  {conditions.map(cond => (
                    <option key={cond.condition_id} value={cond.condition_id}>
                      {cond.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prices, Quantity */}
              <div className="flex flex-col items-start">
                <label>Purchase Price:</label>
                <input
                  id="purchase_price"
                  className="w-full py-2 text-center border border-gray-300 rounded-sm flex"
                  type="number"
                  placeholder="Purchase Price"
                  value={form.purchase_price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col items-start">
                <label>Selling Price:</label>
                <input
                  id="selling_price"
                  className="w-full py-2 text-center border border-gray-300 rounded-sm flex"
                  type="number"
                  placeholder="Selling Price"
                  value={form.selling_price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col items-start">
                <label>Quantity:</label>
                <input
                  id="quantity"
                  className="w-full py-2 text-center border border-gray-300 rounded-sm flex"
                  type="number"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={handleInputChange}
                />
              </div>

              {/* Supply Receipt and Supplier */}
              <div className="flex flex-col items-start">
                <label>Supply Receipt:</label>
                <select
                  id="supply_receipt"
                  className="w-full p-2 border rounded bg-gray-100 text-black"
                  value={form.supply_receipt}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Receipt --</option>
                  {receipts.map(receipt => (
                    <option key={receipt.supply_id} value={receipt.supply_id}>
                      {receipt.receipt_number} ({receipt.supplier_name})
                    </option>
                  ))}
                </select>
                <a
                  className="text-blue-700 font-mono underline mt-[5px] cursor-pointer"
                  onClick={() => setShowReceiptModal(true)}
                >
                  Add Receipt
                </a>
              </div>
              {/* Supplier */}
              <div className="flex flex-col items-start">
                <label>Supplier:</label>
                <select
                  id="supplier_id"
                  className="w-full p-2 border rounded bg-gray-100 text-black"
                  value={form.supplier_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map(supp => (
                    <option key={supp.supplier_id} value={supp.supplier_id}>
                      {supp.name}
                    </option>
                  ))}
                </select>
                <a
                  className="text-blue-700 font-mono underline mt-[5px] cursor-pointer"
                  onClick={() => setShowSupplierModal(true)}
                >
                  Add Supplier
                </a>
              </div>

              {/* Supply Date */}
              <div className="flex flex-col items-start">
                <label htmlFor="supplyDate">Supply Date:</label>
                <input
                  type="date"
                  id="supply_date"
                  className="w-full p-2 border rounded bg-gray-100 text-black"
                  value={form.supply_date}
                  onChange={handleInputChange}
                />
              </div>

              <input type="hidden" id="product_id" value={form.product_id || ''} />
            </div>

            {/* Buttons */}
           <div className="flex-row flex gap-2 w-[450px] mx-auto">
              <button
                className="w-full mt-4 p-2 bg-green-700 text-white  cursor-pointer"
                onClick={handleSave}
              >
                {form.product_id ? "UPDATE" : "CREATE"}
              </button>
              <button
                className="w-full mt-4 p-2 bg-red-700 text-white  cursor-pointer"
                onClick={handleDelete}
              >
                DELETE (Admin Only)
              </button>
              <button
                className="w-full mt-4 p-2 bg-gray-400 text-white  cursor-pointer"
                onClick={resetForm}
              >
                CLEAR
              </button>
            </div>
          </div>

          {/* Right Panel - Inventory Table */}
          <div className="w-[1405px] flex h-screen bg-whiteshell">
            <div className="mt-[10px] mx-auto">
              {/* Search Bar */}
              <div className="mb-[10px] flex items-center justify-center">
                <div className="w-max flex items-center justify-center border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-green-700">
                  <input
                    type="text"
                    id="searchInput"
                    placeholder="Search..."
                    className="w-[1300px] outline-none bg-transparent text-black placeholder-black font-serif"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1118 10.5a7.5 7.5 0 01-1.35 6.15z"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-bold my-[10px]">Inventory</h1>

              <table className="bg-white rounded shadow-md mx-auto w-full">
                <thead>
                  <tr className="bg-white p-5">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Brand</th>
                    <th className="border p-2">Condition</th>
                    <th className="border p-2">Supplier</th>
                    <th className="border p-2">Supply Date</th>
                    <th className="border p-2">Purchase</th>
                    <th className="border p-2">Selling</th>
                    <th className="border p-2">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map(product => {
                      // Color logic: red if quantity === 0, green otherwise
                      let rowClass = '';
                      if (product.quantity === 0) {
                        rowClass = 'bg-red-400 hover:bg-red-500';
                      } else {
                        rowClass = 'bg-green-400 hover:bg-green-500';
                      }
                      return (
                         <tr
                          key={product.product_id}
                          className={`cursor-pointer font-rubik ${rowClass}`}
                          onClick={() => handleRowClick(product)}
                        >
                          <td className="border p-2">{product.product_id}</td>
                          <td className="border p-2">{product.name}</td>
                          <td className="border p-2">{product.category_name || (product.category && product.category.name) || ""}</td>
                          <td className="border p-2">{product.brand_name || (product.brand && product.brand.name) || ""}</td>
                          <td className="border p-2">{product.condition_item}</td>
                          <td className="border p-2">{product.supplier_name || (product.supplier && product.supplier.name) || ""}</td>
                          <td className="border p-2">{product.supply_date || ""}</td>
                          <td className="border p-2">{product.purchase_price}</td>
                          <td className="border p-2">{product.selling_price}</td>
                          <td className="border p-2">{product.quantity}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="border p-2 text-center">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 flex items-baseline mt-[20px] justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg border-2 border-black">
            <h2 className="text-xl font-bold mb-4 text-center">Add New Category</h2>
            <input
              type="text"
              placeholder="Category Name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => {
                  // Add category logic here
                  setShowCategoryModal(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 flex items-baseline mt-[20px] justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg border-2 border-black">
            <h2 className="text-xl font-bold mb-4 text-center">Add New Brand</h2>
            <input
              type="text"
              placeholder="Brand Name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowBrandModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => {
                  // Add brand logic here
                  setShowBrandModal(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 flex items-baseline mt-[20px] justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg border-2 border-black">
            <h2 className="text-xl font-bold mb-4 text-center">Add New Receipt</h2>
            <input
              type="text"
              placeholder="Receipt Name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowReceiptModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => {
                  // Add receipt logic here
                  setShowReceiptModal(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 flex items-baseline mt-[20px] justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg border-2 border-black">
            <h2 className="text-xl font-bold mb-4 text-center">Add New Supplier</h2>
            <input
              type="text"
              placeholder="Supplier Name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowSupplierModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => {
                  // Add supplier logic here
                  setShowSupplierModal(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 flex items-baseline mt-[20px] justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg border-2 border-black">
            <h2 className="text-xl font-bold mb-4 text-center">Add New Receipt</h2>
            <input
              type="text"
              placeholder="Receipt Number"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={newReceiptNumber}
              onChange={e => setNewReceiptNumber(e.target.value)}
            />
            <select
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={newReceiptSupplierId}
              onChange={e => setNewReceiptSupplierId(e.target.value)}
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map(supp => (
                <option key={supp.supplier_id} value={supp.supplier_id}>
                  {supp.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowReceiptModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={async () => {
                  // --- Add receipt logic here ---
                  if (!newReceiptNumber || !newReceiptSupplierId) {
                    alert('Please enter receipt number and select supplier.');
                    return;
                  }
                  await fetch('http://localhost:8000/api/supplies/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      receipt_number: newReceiptNumber,
                      supplier: newReceiptSupplierId,
                      // Add other fields if your model needs (e.g., date, total_cost, user_id)
                    }),
                  });
                  setShowReceiptModal(false);
                  setNewReceiptNumber('');
                  setNewReceiptSupplierId('');
                  // Refresh receipt list
                  fetch('http://localhost:8000/api/supplies/')
                    .then(res => res.json())
                    .then(setReceipts);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
       {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
          <div className="bg-white p-6 rounded-lg w-[350px] shadow-lg border-2 border-black">
            <h2 className="text-lg font-bold mb-3">Admin Authentication</h2>
            <input
              type="text"
              placeholder="Admin Username"
              className="w-full p-2 border border-gray-300 rounded mb-3"
              value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)}
              disabled={deleting}
            />
            <input
              type="password"
              placeholder="Admin Password"
              className="w-full p-2 border border-gray-300 rounded mb-3"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              disabled={deleting}
            />
            {deleteError && <div className="text-red-500 mb-2">{deleteError}</div>}
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowAdminModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-700 text-white rounded"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </>
  );
}

export default Inventory;