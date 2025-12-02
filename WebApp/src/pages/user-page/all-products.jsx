"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import WebHeader from "../../components/WebHeader.jsx";
import Footer from "../../components/Footer.jsx";
import ProductNavi from "../../components/user-components/ProductNavi.jsx";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 16;

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category");

  // Fetch products from backend
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8000/api/products/")
      .then((res) => {
        let data = Array.isArray(res.data) ? res.data : res.data.results || [];
        if (category) {
          data = data.filter((p) => p.category_name === category);
        }
        setProducts(data);
        setLoading(false);
        setCurrentPage(1); // reset to first page when category changes
      })
      .catch((err) => {
        console.error("❌ Failed to fetch products:", err);
        setProducts([]);
        setLoading(false);
      });
  }, [category]);

  // Sort logic
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.selling_price - b.selling_price;
      case "price-high":
        return b.selling_price - a.selling_price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage,
  );

  if (loading)
    return (
      <div className="text-center py-6 text-gray-600">Loading products...</div>
    );

  return (
    <div className="min-h-screen bg-[#fdf2f8]">
      <WebHeader />

      <div className="max-w-[1300px] mx-auto px-2 py-8 flex ">
        {/* Left Sidebar Navigation */}
        <div className="hidden lg:block w-max">
          <ProductNavi />
        </div>

        {/* Main Content */}
        <main className="flex-1 ml-[20px]">
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#eb0505]">
                {category ? `Products in ${category}` : "All Products"}
              </h2>
              <p className="text-sm text-gray-600">
                Showing {sortedProducts.length} product(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {currentProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentProducts.map((product) => {
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
                      <div className="relative justify-center flex bg-white rounded-t-lg w-full h-[220px]">
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="w-full h-[220px] object-cover rounded-t-lg"
                        />
                        {product.discount > 0 && (
                          <span className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

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
                              <span className="text-xs text-gray-500 line-through">
                                ₱{Number(product.selling_price).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-gray-900">
                              ₱{Number(product.selling_price).toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          disabled={product.quantity <= 0}
                          className={`w-full py-1.5 rounded text-xs font-medium transition-colors ${
                            product.quantity > 0
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {product.quantity > 0
                            ? "Add to Cart"
                            : "Out of Stock"}
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border hover:bg-gray-200 disabled:opacity-50"
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded border ${
                        currentPage === i + 1
                          ? "bg-red-600 text-white"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border hover:bg-gray-200 disabled:opacity-50"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or check again later.
              </p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
