"use client";

import {
  ShoppingCart,
  Minus,
  Plus,
  Heart,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import WebHeader from "../../components/WebHeader.jsx";
import WebFooter from "../../components/Footer.jsx";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProductGrid from "../../components/user-components/ProductGrid.jsx";
import { toast } from "react-toastify";

export default function ProductDetail() {
  const [activeTab, setActiveTab] = useState("description");
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/products/${id}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Failed to fetch product:", err));
  }, [id]);

  const incrementQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    console.log("🧩 Add to Cart clicked!");

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    // Try to get user ID from localStorage
    let userId = localStorage.getItem("user_id");
    if (!userId) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        userId = storedUser?.id || storedUser?.user_id;
      } catch (error) {
        console.warn("⚠️ Could not parse stored user:", error);
      }
    }

    console.log("✅ Detected userId:", userId);

    if (!userId) {
      toast.error("User ID missing. Please log in again.");
      return;
    }

    const payload = {
      user: parseInt(userId, 10),
      product: product?.product_id,
      quantity,
      price_at_addition: product?.selling_price,
    };

    console.log("📦 Payload being sent:", payload);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/cart/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("✅ Added successfully:", response.data);
      toast.success("Added to cart!");
    } catch (error) {
      console.error(
        "❌ Error adding to cart:",
        error.response?.data || error.message,
      );
      toast.error("Failed to add to cart");
    }
  };

  if (!product) {
    return <div className="text-center py-6">Loading product...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-100">
      <WebHeader />
      {/* Breadcrumb Navigator */}
      <div className="w-[1300px] mx-auto px-4 mt-4 mb-4">
        <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <span className="text-red-500 hover:underline cursor-pointer">
                {product.category_name}
              </span>
            </li>
            <li className="text-gray-500">›</li>
            <li>
              <span className="text-red-500 hover:underline cursor-pointer">
                {product.brand_name}
              </span>
            </li>
            <li className="text-gray-500">›</li>
            <li>
              <span className="text-gray-800 font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="w-[1300px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-4 rounded-lg shadow-sm">
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-lg flex items-center justify-center w-[500px] h-[400px] ">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[selectedImage].image}
                  alt={product.name}
                  className="w-max h-full object-cover"
                />
              ) : (
                <div className="w-full h-[490px] bg-gray-200 flex items-center justify-center text-gray-600">
                  No Image
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-1">
              {product.images?.slice(0, 4).map((img, index) => {
                // If this is the 4th thumbnail and there are more images, show "+N"
                if (index === 4 && product.images.length > 5) {
                  const remaining = product.images.length - 5;
                  return (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(index)}
                      className="relative border-2 rounded-lg overflow-hidden border-gray-200  w-[100px] h-[100px]"
                    >
                      <img
                        src={img.image}
                        alt={`${product.name} ${index}`}
                        className="w-full h-full object-cover opacity-50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-transparent bg-opacity-50 text-white font-semibold text-lg">
                        +{remaining}
                      </div>
                    </button>
                  );
                }

                // Normal thumbnail
                return (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden w-[100px] h-[100px] ${
                      selectedImage === index
                        ? "border-[#eb0505]"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img.image}
                      alt={`${product.name} ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-gray-600 mb-2">
                {product.brand_name} • {product.category_name}
              </p>
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-600">
                  {product.rating || 0} ({product.reviews || 0})
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-[#eb0505]">
                  ₱{product.selling_price}
                </span>
                <span className="text-green-600 font-medium">
                  ✓ In Stock ({product.quantity} available)
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Quantity:</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-600">
                  Max: {product.quantity} pieces
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                className="w-full bg-[#eb0505] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#d10404] transition-colors flex items-center justify-center space-x-2"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>

              <button className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-[#eb0505]" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-[#eb0505]" />
                <span>2 Year Warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RotateCcw className="w-5 h-5 text-[#eb0505]" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <nav className="flex space-x-8">
            {["description", "specifications"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? "border-[#eb0505] text-[#eb0505]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="py-8 bg-white rounded-lg">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">
                  Product Description
                </h3>
                <p className="text-gray-700 mb-4">
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  {/* Left column */}
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Brand:</span>
                      <span>{product.brand_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Category:</span>
                      <span>{product.category_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Condition:</span>
                      <span>{product.condition_item || "-"}</span>
                    </div>
                    {/* Stock */}
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Stock:</span>
                      <span>{product.quantity}</span>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-3">
                    {/* Compatibility list */}
                    <div className="py-2 border-b">
                      <span className="font-medium block mb-1">
                        Compatible Vehicles:
                      </span>
                      {product.compatible_cars &&
                      product.compatible_cars.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {product.compatible_cars.map((c, i) => (
                            <li key={`compat-${i}`}>
                              {c.car_model.car_make} {c.car_model.model_name} (
                              {c.year_start.year} – {c.year_end.year})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews (placeholder until backend is ready) */}
        <div className="py-8 rounded-lg mt-[30px]">
          <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
          <p className="text-gray-500">No reviews yet.</p>
        </div>

        {/* Related Products */}
        <section className="">
          <div className="w-[1300px]">
            <h2 className="text-2xl font-bold text-[#eb0505] text-justify mb-[20px]">
              Related Products
            </h2>
            <ProductGrid />
          </div>
        </section>
      </div>
      <WebFooter />
    </div>
  );
}
