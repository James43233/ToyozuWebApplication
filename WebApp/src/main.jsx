import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Link } from "react-router-dom";
import './index.css';



import Register from './pages/user-page/register-page.jsx';
import ProtectedRoute from './pages/admin-page/protected-route.jsx'; // <--- updated import
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import StartWeb from './pages/user-page/landing-page.jsx';
import LoginPage from './pages/user-page/login-page.jsx';
import ShoppingCart from './pages/user-page/shopping-cart-page.jsx';
import CartDemo from './pages/user-page/cart-page.jsx';
import UserDashboard from './pages/user-page/user-dashboard-page.jsx';
import ProductTable from './components/admin-components/ProductTable.jsx';
import UploadForm from './components/admin-components/UploadForm.jsx'
import ProductsSection from './components/admin-components/ProductsSection.jsx'
import { AuthProvider } from "./Context/AuthContext";
import Unauthorized from './components/user-components/unauthorized.jsx';
import ProductDetail from "./pages/user-page/product-details.jsx"; // create this
import DisplayProducts from "./pages/user-page/display-product-page.jsx";
import ProductNavi from "./components/user-components/ProductNavi.jsx"
import ProductFiltered from "./components/user-components/ProductFiltered.jsx"
import AddressSection from './components/user-components/AddressSection.jsx';
import CheckoutPage from './pages/user-page/check-out-page.jsx';
import PlaceOrder from './components/user-components/PlaceOrder.jsx';
import OrderHistory from './components/user-components/OrderHistory.jsx';
import OrderSection from './components/admin-components/OrderSection.jsx';
import AllProducts from "./pages/user-page/all-products.jsx";
import AdminDashboard from './pages/admin-page/admin-dashboard.jsx'



const router = createBrowserRouter([
  { path: "/", element: <StartWeb />},
  { path: "/register", element: <Register /> },
  { path: "/login-page", element: <LoginPage /> },
  { path: "/product-navigator", element: <ProductNavi /> },
  { path: "/product-filtered", element: <ProductFiltered /> },
  { path: "/place-order", element: <PlaceOrder /> },
  { path: "/all-products", element: <AllProducts /> },
  


  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
    {
    path: "/admin-dashboard",
    element: (
      <ProtectedRoute requiredRole={1}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shopping-cart",
    element: (
      <ProtectedRoute>
        <ShoppingCart />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cart",
    element: (
      <ProtectedRoute>
        <CartDemo />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user-dashboard",
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },

  {
    path: "/product-table",
    element: (
      <ProtectedRoute>
        <ProductTable />
      </ProtectedRoute>
    ),
  },
  {
    path: "/upload-form",
    element: (
      <ProtectedRoute>
        <UploadForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/products-section",
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
  { path: "/display-products",
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
  { path: "/address-section",
    element: (
      <ProtectedRoute>
        <AddressSection />
      </ProtectedRoute>
    ),
  },
  { path: "/check-out-page",
    element: (
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/order-history",
    element: (
      <ProtectedRoute>
        <OrderHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/order-section",
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
