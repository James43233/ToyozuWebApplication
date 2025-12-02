import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Link } from "react-router-dom";
import './index.css';

import Inventory from './pages/admin-page/Inventory.jsx';
import Admin from './pages/admin-page/Admin.jsx';
import Register from './pages/user-page/Register.jsx';
import ProtectedRoute from './pages/admin-page/Inventory.jsx'; // <--- updated import
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import StartWeb from './pages/user-page/Start.jsx';
import LoginPage from './pages/user-page/LoginPage.jsx';
import ShoppingCart from './pages/user-page/ShoppingCart.jsx';
import CartDemo from './pages/user-page/Cart-demo.jsx';
import UserDashboard from './pages/user-page/UserDashboard.jsx';
import AdminDashboard from './pages/admin-page/AdminDashboard.jsx';
import ProductTable from './components/admin-components/ProductTable.jsx';
import UploadForm from './components/admin-components/UploadForm.jsx'
import ProductsSection from './components/admin-components/ProductsSection.jsx'
import { AuthProvider } from "./Context/AuthContext";
import Unauthorized from './components/user-components/unauthorized.jsx';
import ProductDetail from "./pages/user-page/ProductDetails.jsx"; // create this
import DisplayProducts from "./pages/user-page/DisplayProducts.jsx";
import ProductNavi from "./components/user-components/ProductNavi.jsx"
import ProductFiltered from "./components/user-components/ProductFiltered.jsx"
import AddressSection from './components/user-components/AddressSection.jsx';
import CheckoutPage from './pages/user-page/CheckOutPage.jsx';
import PlaceOrder from './components/user-components/PlaceOrder.jsx';
import OrderHistory from './components/user-components/OrderHistory.jsx';
import OrderSection from './components/admin-components/OrderSection.jsx';
import AllProducts from "./pages/user-page/AllProducts.jsx";



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
