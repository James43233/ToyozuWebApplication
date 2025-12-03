import '../../src/App.css';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Arrival.png";
import { Search, ShoppingCart, User } from "lucide-react";
import axios from "axios";

function CartHeader() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const userId = localStorage.getItem("user_id");

  const isLoggedIn = !!localStorage.getItem("access_token");
  const roleId = localStorage.getItem("role_id"); // ✅ fixed lowercase key

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:8000/api/cart/?user=${userId}`)
      .then((response) => {
        setCartCount(response.data.length || 0);
      })
      .catch((error) => {
        console.error("Error fetching cart:", error);
        setCartCount(0);
      });
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b-2 border-[#eb0505] px-6 py-3 flex items-center justify-between shadow-sm w-full">
      {/* Logo + Label */}
      <div
        className="flex items-center cursor-pointer flex-1 justify-center"
        onClick={() => navigate("/")}
      >
        <img src={Logo} alt="Toyozu Logo" className="h-[60px] w-auto" />
        <span className="ml-4 text-xl font-bold">Shopping Cart</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-lg mx-8 flex justify-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-[600px] px-4 py-2 border border-gray-300 rounded-full pr-10 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-6 relative justify-center flex-1 gap-10">
        {/* Cart with count */}
        <div className="relative">
          <ShoppingCart
            className="w-6 h-6 text-gray-700 cursor-pointer hover:text-red-600 transition"
            onClick={() => navigate("/cart")}
          />
          <span className="absolute -bottom-1 -right-2 bg-red-600 text-white text-xs font-semibold rounded-full w-4 h-4 flex items-center justify-center">
            {cartCount || 0}
          </span>
        </div>

        {/* User Menu */}
        {isLoggedIn ? (
          <div className="relative">
            <User
              className="w-7 h-7 text-gray-700 cursor-pointer hover:text-red-600 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            />
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/user-dashboard");
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Account
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/unauthorized");
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Purchases
                </button>

                {(roleId === "1" || roleId === "2" || roleId === "3") && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/admin-dashboard");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Admin Dashboard
                  </button>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login-page")}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
            >
              Sign In
            </button>
            <span className="h-6 border-l border-red-600"></span>
            <button
              onClick={() => navigate("/register")}
              className="text-sm font-medium text-gray-700 hover:text-red-600 transition"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartHeader;
