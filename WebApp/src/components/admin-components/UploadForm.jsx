import { useState } from "react";
import axios from "axios";

export default function ProductImageUpload({ productId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!productId) {
      setMessage("❌ Product ID is missing. Cannot upload images.");
      return;
    }

    if (files.length === 0) {
      setMessage("⚠️ Please select at least one image to upload.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setMessage("❌ You must be logged in to upload images.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    setUploading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `http://localhost:8000/api/products/${productId}/upload-images/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("✅ Images uploaded successfully.");
      console.log("Uploaded:", res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data || err.message;
      setMessage(`❌ Upload failed: ${errorMsg}`);
      console.error("Upload failed:", errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="block w-[190px] text-sm text-gray-700 cursor-pointer border rounded-sm border-black bg-gray-200"
      />

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className={`px-4 py-2 rounded-lg text-white ${
          uploading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {uploading ? "Uploading..." : "Upload Images"}
      </button>

      {message && <p className="text-sm text-gray-800">{message}</p>}
    </div>
  );
}