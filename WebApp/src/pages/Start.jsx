"use client";

import { Search, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../Header.jsx";
import bremboLogo from "../assets/brembo-logo.png";
import boschLogo from "../assets/bosch-logo.png";
import ngkLogo from "../assets/ngk-logo.png";
import densoLogo from "../assets/denso-logo.png";
import mobil1Logo from "../assets/mobil-1-logo.png";
import castrolLogo from "../assets/castrol-logo.png";
import michelinLogo from "../assets/michelin-logo.png";
import bridgestoneLogo from "../assets/bridgestone-logo.png";
import continentalLogo from "../assets/continental-logo.png";
import acdelcoLogo from "../assets/acdelco-logo.png";
import mannFilterLogo from "../assets/mann-filter-logo.png";
import kybLogo from "../assets/kyb-logo.png";
import automotiveBanner from "../assets/automotive-banner.png";
import brakePadsBanner from "../assets/brake-pads-promotion-banner.png";
import oilFiltersBanner from "../assets/oil-filters-sale-banner.png";
import Logo from "../assets/Arrival.png";
import WebHeader from "../WebHeader.jsx";
import Footer from "../Footer.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { Car, Zap, Wrench, Droplet, Circle, HelpCircle } from "lucide-react";

import ToyozuGIF from "../assets/New.jpg";

export default function ToyozuEcommerce() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/categories/")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("❌ Failed to fetch categories:", err));
  }, []);

  const brands = [
    { name: "Brembo", logo: bremboLogo },
    { name: "Bosch", logo: boschLogo },
    { name: "NGK", logo: ngkLogo },
    { name: "Denso", logo: densoLogo },
    { name: "Mobil 1", logo: mobil1Logo },
    { name: "Castrol", logo: castrolLogo },
    { name: "Michelin", logo: michelinLogo },
    { name: "Bridgestone", logo: bridgestoneLogo },
    { name: "Continental", logo: continentalLogo },
    { name: "ACDelco", logo: acdelcoLogo },
    { name: "Mann Filter", logo: mannFilterLogo },
    { name: "KYB", logo: kybLogo },
  ];
  const iconMap = {
    "Wield Shield": "🛡️",
    "Brake Fluid": "💧",
    Coolant: "🧊",
    "Head Lights": "💡",
    "Spark Plug": "⚡",
    "Engine Oil": "🛢️",
    "Brake Pad": "🛞",
    "Air Filter": "🌬️",
    "Fuel Filter": "⛽",
  };

  const slideImages = [automotiveBanner, brakePadsBanner, oilFiltersBanner];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [currentBrandSlide, setCurrentBrandSlide] = useState(0);
  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 10);
  const [carMakes, setCarMakes] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [years, setYears] = useState([]);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Fetch car makes
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/cars/")
      .then((res) => res.json())
      .then((data) => setCarMakes(data));
  }, []);

  // Fetch car models
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/car-models/")
      .then((res) => res.json())
      .then((data) => setCarModels(data));
  }, []);

  // Fetch years
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/years/")
      .then((res) => res.json())
      .then((data) => setYears(data));
  }, []);

  const handleSearch = () => {
    fetch(`/api/products/?car_model=${selectedModel}&year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Compatible products:", data);
        // Show results in UI
      });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slideImages.length]);

  useEffect(() => {
    const brandTimer = setInterval(() => {
      setCurrentBrandSlide((prev) => (prev + 1) % Math.ceil(brands.length / 6));
    }, 3000);
    return () => clearInterval(brandTimer);
  }, [brands.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + slideImages.length) % slideImages.length,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-100">
      <WebHeader />
      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden">

        {/* Full-screen GIF background */}
        <img
          src={ToyozuGIF}
          alt="Toyozu Promo GIF"
          className="absolute inset-0 w-full h-[500px] object-cover z-0 blur-sm"
        />

        {/* Content over GIF */}
        <div className="relative z-[10] flex justify-center items-center h-full px-4 pb-35">

          <div className="p-10">

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-sm">
                Find Parts for Your Vehicle
              </h2>
              <p className="text-white/100  drop-shadow-sm">
                Select your car details to find compatible parts
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-[#eb0505] to-red-400 mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Main container with white background */}
            <div className="bg-white/95 w-[800px] p-6 rounded-lg shadow-lg flex-row flex justify-between items-start gap-6">
              {/* Sectioning */}
              <div className="w-[600px]">
                  {/* LEFT SIDE — Form */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Car Brand
                    </label>
                    <select
                      value={selectedMake}
                      onChange={(e) => {
                        setSelectedMake(e.target.value);
                        setSelectedModel("");
                      }}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 bg-white focus:border-[#eb0505] focus:ring-2 focus:ring-red-100 transition-all"
                    >
                      <option value="">Select Brand</option>
                      {carMakes.map((make) => (
                        <option key={make.car_id} value={make.car_id}>{make.make}</option>
                      ))}
                    </select>
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Car Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={!selectedMake}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 bg-white disabled:bg-gray-100 focus:border-[#eb0505] focus:ring-2 focus:ring-red-100 transition-all"
                    >
                      <option value="">Select Model</option>
                      {carModels
                        .filter((m) => String(m.car_id) === String(selectedMake))
                        .map((model) => (
                          <option key={model.model_id} value={model.model_id}>
                            {model.model_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Year Model
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      disabled={!selectedModel}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 bg-white disabled:bg-gray-100 focus:border-[#eb0505] focus:ring-2 focus:ring-red-100 transition-all"
                    >
                      <option value="">Select Year</option>
                      {years.map((y) => (
                        <option key={y.year_id} value={y.year}>{y.year}</option>
                      ))}
                    </select>
                  </div>

                </div>
                <div className="lg:col-span-4 flex justify-center mt-4">
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-[#eb0505] to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Find Compatible Parts</span>
                  </button>
                </div>

              </div>

              
              {/* RIGHT SIDE — Information Box */}
              <div className="flex flex-col justify-center p-6 bg-red-50 border border-red-200 rounded-lg w-[250px]">
                <h3 className="text-lg font-bold text-red-700 mb-2">
                  Quick Tip
                </h3>
                <p className="text-sm text-red-700/80 leading-relaxed">
                  Select your vehicle’s brand, model, and year to instantly find parts compatible with your car.
                </p>
              </div>

             
              

            </div>
          </div>

        </div>
      </section>

      

      {/* Categories Section */}
      <section className="py-12 px-4">
        <div className="w-[1300px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold ">CATEGORIES</h2>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {categories.map((category, i) => {
              const icon = iconMap[category.name] || "📦"; // default fallback

              return (
                <Link
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="bg-[#eb0505] text-white px-4 py-3 rounded-lg flex items-center space-x-2 font-medium hover:bg-[#d10404] hover:scale-105 transition-all duration-200 hover:shadow-lg transform"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both`,
                  }}
                >
                  <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-lg">
                    {/* render emoji as text */}
                    <span>{icon}</span>
                  </div>
                  <span className="text-sm">{category.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-gray-600 font-medium hover:underline transition-all duration-150 hover:scale-105"
            >
              {showAllCategories ? "Show Less" : "More"}
            </button>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section id="brands" className="py-12 px-4 bg-transparent">
        <div className="w-[1300px] mx-auto">
          <h2 className="text-2xl font-bold text-justify mb-8">
            TRUSTED BRANDS
          </h2>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentBrandSlide * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(brands.length / 6) }).map(
                (_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-6 gap-6">
                      {brands
                        .slice(slideIndex * 6, (slideIndex + 1) * 6)
                        .map((brand, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center"
                            style={{
                              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                            }}
                          >
                            <img
                              src={brand.logo || "/placeholder.svg"}
                              alt={brand.name}
                              className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Brand navigation dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(brands.length / 6) }).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBrandSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentBrandSlide
                        ? "bg-[#eb0505]"
                        : "bg-gray-300"
                    }`}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="">
        <div className="max-w-full mx-auto flex justify-center items-center flex-col">
          <h2 className="text-2xl font-bold  text-justify mb-8">
            Discovery
          </h2>
          <ProductGrid />
        </div>
      </section>
      <Footer />
    </div>
  );
}
