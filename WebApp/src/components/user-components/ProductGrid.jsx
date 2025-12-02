import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20); // 4 rows × 5 columns

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products/")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch products:", err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="text-center py-6">Loading products...</div>;
  if (!products.length)
    return (
      <div className="text-center py-6 text-gray-500">No products found</div>
    );

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="flex flex-col">
      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-[1270px] ">
        {visibleProducts.map((product) => {
          const firstImage =
            product.images?.[0]?.image ||
            product.images?.[0]?.url ||
            "/placeholder.svg";

          return (
            <Link
              key={product.product_id}
              to={`/products/${product.product_id}`}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow block"
            >
              {/* Image */}
              <div className="relative justify-center flex bg-white rounded-t-lg w-full h-[220px]">
                <img
                  src={firstImage}
                  alt={product.name}
                  className="w-full h-[220px] object-cover rounded-t-lg"
                />
                {product.discount > 0 && (
                  <span className="absolute top-2 right-2 bg-[#ffdad4] text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{product.discount}%
                  </span>
                )}
                {product.quantity <= 0 && (
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center rounded-t-lg">
                    <span className="bg-white text-gray-900 px-3 py-1 rounded font-semibold text-xs">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-1">
                  {product.brand_name}
                </div>
                <h3
                  className="font-semibold text-gray-900 mb-1 text-sm line-clamp-2 h-[50px]"
                  title={product.name}
                >
                  {product.name}
                </h3>

                {/* Rating */}
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

                {/* Price */}
                <div className="mb-3">
                  {product.discount > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-600">
                        ₱
                        {(
                          product.selling_price *
                          (1 - product.discount / 100)
                        ).toFixed(2)}
                      </span>
                      <span className="text-xs text-red-500 line-through">
                        ₱{Number(product.selling_price).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-[#73342b]">
                      ₱{Number(product.selling_price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Add to cart */}
                <button
                  disabled={product.quantity <= 0}
                  className={`w-full py-1.5 rounded text-xs font-medium transition-colors ${
                    product.quantity > 0
                      ? "bg-[#ffdad4] text-white hover:bg-[#5a261f]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      {/* More Button */}
      {visibleCount < products.length && (
        <Link
          to="/AllProducts" // 👈 This route will go to your full product list page
          className="bg-[#ffdad4] text-white px-8 py-2 rounded-full font-semibold hover:bg-[#5a261f] transition mt-[20px] max-w-[100px] flex items-center justify-center mx-auto mb-[40px]"
        >
          More
        </Link>
      )}
    </div>
  );
}
