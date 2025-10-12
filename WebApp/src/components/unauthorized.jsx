// Unauthorized.jsx
export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-red-600">Unauthorized Access</h1>
      <p className="mt-2 text-gray-600">You don’t have permission to view this page.</p>
    </div>
  );
}
