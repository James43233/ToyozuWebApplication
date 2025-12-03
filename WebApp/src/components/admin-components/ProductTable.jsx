import { useEffect, useState } from "react";
import axios from "axios";
import ProductImageUpload from "./UploadForm";

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeProductId, setActiveProductId] = useState(null);
  const [editProductId, setEditProductId] = useState(null);
  

  // Dropdown data
  const [cars, setCars] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    compatibilities: [] // ✅ always an array
  });
  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:8000/api/cars/"),
      axios.get("http://localhost:8000/api/car-models/"),
      axios.get("http://localhost:8000/api/years/"),
      axios.get("http://localhost:8000/api/brands/"),
      axios.get("http://localhost:8000/api/categories/")
    ])
      .then(([carsRes, modelsRes, yearsRes, brandsRes, categoriesRes]) => {
        setCars(Array.isArray(carsRes.data) ? carsRes.data : []);
        setModels(Array.isArray(modelsRes.data) ? modelsRes.data : []);
        setYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);
        setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      })
      .catch((err) => console.error("❌ Failed to fetch dropdown data:", err));
  }, []);

  // Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products/")
      .then((res) => {
        setProducts(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch products:", err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  // Update compatibility row
  const updateCompat = (idx, key, value) => {
    setFormData((prev) => {
      const next = [...prev.compatibilities];
      next[idx] = { ...next[idx], [key]: value };
      return { ...prev, compatibilities: next };
    });
  };

  // Handle quick update
  // Handle quick update
  const handleQuickUpdate = async (e) => {
    e.preventDefault();

    console.log("🟡 [DEBUG] Submitting quick update for:", editProductId);
    console.log("🟡 [DEBUG] Raw formData:", formData);

    const payload = {
      name: formData.name,
      description: formData.description,
      brand_id: formData.brand,        // change here
      category_id: formData.category,  // and here
      purchase_price: formData.purchase_price,
      selling_price: formData.selling_price,
      quantity: formData.quantity,
      weight: formData.weight,
    };

    console.log("🟡 [DEBUG] Payload to send:", payload);

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/products/${editProductId}/`,
        payload,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      console.log("✅ [DEBUG] Server update response:", response.data);

      // Fetch fresh product list after update
      const refreshed = await axios.get("http://localhost:8000/api/products/");
      console.log("✅ [DEBUG] Refetched products:", refreshed.data);

      setProducts(refreshed.data);
      setEditProductId(null);

      setFormData({
        name: "",
        brand: "",
        category: "",
        purchase_price: "",
        selling_price: "",
        quantity: "",
        weight: 0.5,
        description: "",
        compatibilities: []
      });

    } catch (err) {
      console.error("❌ [DEBUG] Update failed!");
      console.error("🟥 Error message:", err.message);
      console.error("🟥 Server response:", err.response?.data || "(no response data)");
      console.error("🟥 Full error object:", err);
    }
  };


  if (loading) {
    return <div className="text-center py-6">Loading products...</div>;
  }

  if (!products.length) {
    return <div className="text-center py-6 text-gray-500">No products found</div>;
  }

  return (
    <div className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg max-w-8xl mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">PRODUCT INVENTORY</h3>
        <p className="text-sm text-gray-600">Current stock and pricing overview</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600 border-b border-gray-300">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2 font-medium text-gray-900">
                  {product.name}
                </td>

                <td className="px-4 py-2">{product.brand_name}</td>

                <td className="px-4 py-2">{product.category_name}</td>

                <td className="px-4 py-2 text-green-600 font-semibold">
                  ₱{Number(product.selling_price).toFixed(2)}
                </td>

                <td className="px-4 py-2">{product.quantity}</td>

                <td className="px-4 py-2 space-x-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => setActiveProductId(product.product_id)}
                  >
                    Upload Photo
                  </button>

                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    onClick={() => {
                      setEditProductId(product.product_id);

                      setFormData({
                        name: product.name || "",
                        description: product.description || "",
                        brand: product.brand_id || "",
                        category: product.category_id || "",
                        purchase_price: product.purchase_price || "",
                        selling_price: product.selling_price || "",
                        quantity: product.quantity || "",
                        weight: product.weight || 0.5,
                        compatibilities: product.compatibilities || [],
                      });

                      console.log("🧩 Product data:", product);
                    }}
                  >
                    Quick Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Image Upload */}
      {activeProductId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
              onClick={() => setActiveProductId(null)}
            >
              &times;
            </button>
            <h4 className="text-lg font-bold mb-4">Upload Images for Product ID: {activeProductId}</h4>
            <ProductImageUpload productId={activeProductId} />
          </div>
        </div>
      )}


      {/* Modal for Quick Update */}
      {editProductId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
              onClick={() => setEditProductId(null)}
            >
              &times;
            </button>
            <h4 className="text-lg font-bold mb-4">
              Quick Update for Product ID: {editProductId}
            </h4>

            <form onSubmit={handleQuickUpdate} className="space-y-4">
              {/* Product Name */}
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* Brand */}
              <select
                value={formData.brand || ""}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Select Brand --</option>
                {brands.map((b) => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Category */}
              <select
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Selling Price */}
              <input
                type="number"
                placeholder="Selling Price"
                value={formData.selling_price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, selling_price: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* Weight */}
              <input
                type="number"
                step="0.01"
                placeholder="Weight (kg)"
                value={formData.weight || ""}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* Description */}
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />

              {/* Compatibility rows (keep as is) */}
              {(formData.compatibilities || []).map((c, idx) => (
                <div key={`compat-${idx}`} className="grid grid-cols-4 gap-2 mb-2">
                  <select
                    value={c.carId || ""}
                    onChange={(e) => updateCompat(idx, "carId", e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">-- Make --</option>
                    {cars.map((car) => (
                      <option key={car.car_id} value={car.car_id}>
                        {car.make}
                      </option>
                    ))}
                  </select>
                  <select
                    value={c.modelId || ""}
                    onChange={(e) => updateCompat(idx, "modelId", e.target.value)}
                    className="border px-2 py-1 rounded"
                    disabled={!c.carId}
                  >
                    <option value="">-- Model --</option>
                    {models
                      .filter((m) => String(m.car_id) === String(c.carId))
                      .map((m) => (
                        <option key={m.model_id} value={m.model_id}>
                          {m.model_name}
                        </option>
                      ))}
                  </select>
                  <select
                    value={c.yearStartId || ""}
                    onChange={(e) =>
                      updateCompat(idx, "yearStartId", e.target.value)
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">Start Year</option>
                    {years.map((y) => (
                      <option key={y.year_id} value={y.year_id}>
                        {y.year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={c.yearEndId || ""}
                    onChange={(e) =>
                      updateCompat(idx, "yearEndId", e.target.value)
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">End Year</option>
                    {years.map((y) => (
                      <option key={y.year_id} value={y.year_id}>
                        {y.year}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Add compatibility row */}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    compatibilities: [
                      ...(prev.compatibilities || []),
                      {
                        carId: "",
                        modelId: "",
                        yearStartId: "",
                        yearEndId: "",
                      },
                    ],
                  }))
                }
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                + Add Compatibility
              </button>

              {/* Save button */}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-4"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}