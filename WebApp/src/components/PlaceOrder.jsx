import { Link } from "react-router-dom";
import WebHeader from "../WebHeader";

export default function PlaceOrder() {
  return (
    <div>
      <WebHeader />
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Order Successful</h1>
          <p className="mb-8 text-gray-700">Thank you for your order! We'll process it soon.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-6 rounded-lg border transition"
            >
              Back to Home
            </Link>
            <Link
              to="/UserDashboard"
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}