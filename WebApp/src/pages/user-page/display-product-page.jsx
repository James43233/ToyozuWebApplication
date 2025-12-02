"use client"

import { useState } from "react"

import WebHeader from "../../components/WebHeader.jsx"
import Footer from "../../components/Footer.jsx"
import ProductNavi from "../../components/user-components/ProductNavi.jsx"
import ProductFiltered from "../../components/user-components/ProductFiltered.jsx"

import { useLocation } from "react-router-dom";



export default function ProductsPage() {
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    rating: 0,
    categories: [],
    brands: [],
  })

  const [sortBy, setSortBy] = useState("featured")

  const products = [
    {
      id: 1,
      name: "Premium Brake Pads Set",
      category: "Brake Pads",
      brand: "Bosch",
      price: 89.99,
      rating: 4.8,
      reviews: 234,
      image: "/brake-pads-automotive-parts.jpg",
      inStock: true,
      discount: 15,
    },
    {
      id: 2,
      name: "Synthetic Oil Filter",
      category: "Oil Filters",
      brand: "Mobil 1",
      price: 24.99,
      rating: 4.9,
      reviews: 567,
      image: "/oil-filter-automotive.jpg",
      inStock: true,
      discount: 0,
    },
    {
      id: 3,
      name: "Iridium Spark Plugs (4-Pack)",
      category: "Spark Plugs",
      brand: "NGK",
      price: 45.99,
      rating: 4.7,
      reviews: 892,
      image: "/spark-plugs-automotive.jpg",
      inStock: true,
      discount: 20,
    },
    {
      id: 4,
      name: "All-Season Performance Tire",
      category: "Tires",
      brand: "Michelin",
      price: 189.99,
      rating: 4.9,
      reviews: 1234,
      image: "/car-tire-automotive.jpg",
      inStock: true,
      discount: 10,
    },
    {
      id: 5,
      name: "AGM Car Battery 12V",
      category: "Batteries",
      brand: "ACDelco",
      price: 159.99,
      rating: 4.6,
      reviews: 445,
      image: "/car-battery-automotive.jpg",
      inStock: true,
      discount: 0,
    },
    {
      id: 6,
      name: "High-Flow Air Filter",
      category: "Air Filters",
      brand: "K&N",
      price: 54.99,
      rating: 4.8,
      reviews: 678,
      image: "/air-filter-automotive.jpg",
      inStock: false,
      discount: 0,
    },
    {
      id: 7,
      name: "Serpentine Belt Kit",
      category: "Belts & Hoses",
      brand: "Gates",
      price: 67.99,
      rating: 4.7,
      reviews: 321,
      image: "/serpentine-belt-automotive.jpg",
      inStock: true,
      discount: 5,
    },
    {
      id: 8,
      name: "Shock Absorber Pair",
      category: "Suspension",
      brand: "Monroe",
      price: 234.99,
      rating: 4.8,
      reviews: 456,
      image: "/shock-absorber-automotive.jpg",
      inStock: true,
      discount: 15,
    },
    {
      id: 9,
      name: "Stainless Steel Exhaust System",
      category: "Exhaust",
      brand: "MagnaFlow",
      price: 499.99,
      rating: 4.9,
      reviews: 189,
      image: "/exhaust-system-automotive.jpg",
      inStock: true,
      discount: 0,
    },
    {
      id: 10,
      name: "Engine Gasket Set",
      category: "Engine Parts",
      brand: "Fel-Pro",
      price: 129.99,
      rating: 4.6,
      reviews: 234,
      image: "/engine-gasket-automotive.jpg",
      inStock: true,
      discount: 10,
    },
    {
      id: 11,
      name: "Ceramic Brake Pads",
      category: "Brake Pads",
      brand: "Wagner",
      price: 74.99,
      rating: 4.5,
      reviews: 567,
      image: "/ceramic-brake-pads.png",
      inStock: true,
      discount: 0,
    },
    {
      id: 12,
      name: "Premium Wiper Blades",
      category: "Engine Parts",
      brand: "Bosch",
      price: 29.99,
      rating: 4.7,
      reviews: 890,
      image: "/wiper-blades-automotive.jpg",
      inStock: true,
      discount: 0,
    },
  ]
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const category = params.get("category"); // "Engine Oil"
    


  

  const filteredProducts = products.filter((product) => {
    const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    const matchesRating = product.rating >= filters.rating
    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category)
    const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand)

    return matchesPrice && matchesRating && matchesCategory && matchesBrand
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })
  

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf2f8" }}>
      {/* Header */}
      <WebHeader/>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
            <ProductNavi/>
          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#eb0505]">
                    {category ? `Products in ${category}` : "All Products"}
                </h2>
                <p className="text-sm text-gray-600">
                  {filters.categories.length > 0 && `Categories: ${filters.categories.join(", ")} • `}
                  {filters.brands.length > 0 && `Brands: ${filters.brands.join(", ")}`}
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
            <div>
                <ProductFiltered category={category} />
            </div>
            {sortedProducts.length === 0 && (
              <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
                <button
                  onClick={() =>
                    setFilters({
                      priceRange: [0, 1000],
                      rating: 0,
                      categories: [],
                      brands: [],
                    })
                  }
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
