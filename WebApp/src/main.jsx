import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Link } from "react-router-dom";
import './index.css';
import Dashboard from './pages/Dashboard.jsx';
import Inventory from './pages/Inventory.jsx';
import Admin from './pages/Admin.jsx';
import Register from './pages/Register.jsx';
import ProtectedRoute from './pages/ProtectedRoute.jsx'; // <--- updated import
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import StartWeb from './pages/Start.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ShoppingCart from './pages/ShoppingCart.jsx';
import CartDemo from './pages/Cart-demo.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProductTable from './components/ProductTable.jsx';
import UploadForm from './components/UploadForm.jsx'
import ProductsSection from './components/ProductsSection.jsx'
import { AuthProvider } from "./Context/AuthContext";
import Unauthorized from './components/unauthorized.jsx';
import ProductDetail from "./pages/ProductDetails.jsx"; // create this
import DisplayProducts from "./pages/DisplayProducts.jsx";
import ProductNavi from "./components/ProductNavi.jsx"
import ProductFiltered from "./components/ProductFiltered.jsx"
import AddressSection from './components/AddressSection.jsx';
import CheckoutPage from './pages/CheckOutPage.jsx';
import PlaceOrder from './components/PlaceOrder.jsx';
import OrderHistory from './components/OrderHistory.jsx';
import OrderSection from './components/OrderSection.jsx';
import AllProducts from "./pages/AllProducts.jsx";



const router = createBrowserRouter([
  { path: "/", element: <StartWeb />},
  { path: "/Register", element: <Register /> },
  { path: "/LoginPage", element: <LoginPage /> },
  { path: "/Start", element: <StartWeb /> },
  { path: "/ProductNavi", element: <ProductNavi /> },
  { path: "/ProductFiltered", element: <ProductFiltered /> },
  { path: "/PlaceOrder", element: <PlaceOrder /> },
  { path: "/AllProducts", element: <AllProducts /> },
  


  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },



  {
    path: "/Dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Inventory",
    element: (
      <ProtectedRoute>
        <Inventory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Admin",
    element: (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ShoppingCart",
    element: (
      <ProtectedRoute>
        <ShoppingCart />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Cart-demo",
    element: (
      <ProtectedRoute>
        <CartDemo />
      </ProtectedRoute>
    ),
  },
  {
    path: "/UserDashboard",
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/AdminDashboard",
    element: (
      <ProtectedRoute requiredRole={1}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  {
    path: "/ProductTable",
    element: (
      <ProtectedRoute>
        <ProductTable />
      </ProtectedRoute>
    ),
  },
  {
    path: "/UploadForm",
    element: (
      <ProtectedRoute>
        <UploadForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ProductsSection",
    element: (
      <ProtectedRoute>
        <ProductsSection />
      </ProtectedRoute>
    ),
  },
  {
    path: "/products",
    element: (
      <ProtectedRoute>
        <DisplayProducts />
      </ProtectedRoute>
    ),
  },

  {
    path: "/products/:id",
    element: (
      <ProtectedRoute>
        <ProductDetail />
      </ProtectedRoute>
    ),
  },
  { path: "/DisplayProducts",
    element: (
      <ProtectedRoute>
        <DisplayProducts />
      </ProtectedRoute>
    ),
  },
  {
    path: "/category/:categoryName",
    element: (
      <ProtectedRoute>
        <DisplayProducts />
      </ProtectedRoute>
    ),
  },
  { path: "/AddressSection",
    element: (
      <ProtectedRoute>
        <AddressSection />
      </ProtectedRoute>
    ),
  },
  { path: "/CheckoutPage",
    element: (
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/OrderHistory",
    element: (
      <ProtectedRoute>
        <OrderHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/OrderSection",
    element: (
      <ProtectedRoute>
        <OrderSection />
      </ProtectedRoute>
    ),
  }





]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
