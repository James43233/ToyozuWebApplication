"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

export default function Addresses() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // form state
  const [street, setStreet] = useState("")
  const [phone, setPhone] = useState("")

  // dropdown state
  const [regions, setRegions] = useState([])
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])

  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedMunicipality, setSelectedMunicipality] = useState("")
  const [selectedBarangay, setSelectedBarangay] = useState("")

  const userId = localStorage.getItem("user_id")

  // Fetch addresses
  useEffect(() => {
    if (!userId) return
    axios.get(`http://localhost:8000/api/addresses/?user=${userId}`)
      .then(res => setAddresses(res.data))
      .catch(err => console.error("Failed to fetch addresses:", err))
      .finally(() => setLoading(false))
  }, [userId])

  // Load regions on mount
  useEffect(() => {
    axios.get("http://localhost:8000/api/regions/")
      .then(res => setRegions(res.data))
  }, [])

  // Load provinces when region changes
  useEffect(() => {
    if (selectedRegion) {
      axios.get(`http://localhost:8000/api/provinces/?region=${selectedRegion}`)
        .then(res => setProvinces(res.data))
    } else {
      setProvinces([])
    }
    setSelectedProvince("")
    setMunicipalities([])
    setBarangays([])
  }, [selectedRegion])

  // Load municipalities when province changes
  useEffect(() => {
    if (selectedProvince) {
      axios.get(`http://localhost:8000/api/municipalities/?province=${selectedProvince}`)
        .then(res => setMunicipalities(res.data))
    } else {
      setMunicipalities([])
    }
    setSelectedMunicipality("")
    setBarangays([])
  }, [selectedProvince])

  // Load barangays when municipality changes
  useEffect(() => {
    if (selectedMunicipality) {
      axios.get(`http://localhost:8000/api/barangays/?municipality=${selectedMunicipality}`)
        .then(res => setBarangays(res.data))
    } else {
      setBarangays([])
    }
    setSelectedBarangay("")
  }, [selectedMunicipality])

  // Add new address
  const handleAddAddress = async (e) => {
    e.preventDefault()
    if (!userId || !street || !selectedBarangay) {
      toast.error("Please complete all fields")
      return
    }

    const newAddress = {
      user: parseInt(userId, 10),
      street_house_building_no: street,
      barangay: selectedBarangay,
      phone,
      is_default: addresses.length === 0
    }

    try {
      const res = await axios.post("http://localhost:8000/api/addresses/", newAddress)
      setAddresses([...addresses, res.data])
      toast.success("Address added!")
      setShowForm(false)
      // reset form
      setStreet("")
      setPhone("")
      setSelectedRegion("")
      setSelectedProvince("")
      setSelectedMunicipality("")
      setSelectedBarangay("")
    } catch (err) {
      console.error(err)
      toast.error("Failed to add address")
    }
  }

  if (loading) return <p>Loading addresses...</p>

  return (
    <div className="space-y-6">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-red-600 mb-2">My Addresses</h2>
            <p className="text-gray-600">Manage your delivery addresses</p>
        </div>

        <div className="max-w-4xl mx-auto">
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                    {showForm ? "Cancel" : "+ Add New Address"}
                </button>
            </div>

            {showForm && (
            <form
                onSubmit={handleAddAddress}
                className="bg-white p-6 rounded-lg shadow-sm border mb-6 space-y-4 w-[600px] mx-auto"
            >

                {/* Dropdowns in 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full border p-2 rounded"
                >
                    <option value="">Select Region</option>
                    {regions.map((r) => (
                    <option key={r.region_id} value={r.region_id}>
                        {r.name}
                    </option>
                    ))}
                </select>

                <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full border p-2 rounded"
                    disabled={!provinces.length}
                >
                    <option value="">Select Province</option>
                    {provinces.map((p) => (
                    <option key={p.province_id} value={p.province_id}>
                        {p.name}
                    </option>
                    ))}
                </select>

                <select
                    value={selectedMunicipality}
                    onChange={(e) => setSelectedMunicipality(e.target.value)}
                    className="w-full border p-2 rounded"
                    disabled={!municipalities.length}
                >
                    <option value="">Select Municipality</option>
                    {municipalities.map((m) => (
                    <option key={m.municipality_id} value={m.municipality_id}>
                        {m.name}
                    </option>
                    ))}
                </select>

                <select
                    value={selectedBarangay}
                    onChange={(e) => setSelectedBarangay(e.target.value)}
                    className="w-full border p-2 rounded"
                    disabled={!barangays.length}
                >
                    <option value="">Select Barangay</option>
                    {barangays.map((b) => (
                    <option key={b.barangay_id} value={b.barangay_id}>
                        {b.name}
                    </option>
                    ))}
                </select>
                </div>
                {/* Street full width */}
                <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Street / House / Building No."
                className="w-full border p-2 rounded"
                required
                />

                <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                Save Address
                </button>
            </form>
            )}

            {/* Existing addresses list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
                <div
                key={address.id}
                className="bg-white p-6 rounded-lg shadow-sm border relative"
                >
                {address.is_default && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                    Default
                    </span>
                )}

                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-700 font-medium">
                    {address.street_house_building_no}
                    </p>
                </div>

                <div className="space-y-1 text-gray-600 text-sm">
                    <p><span className="font-medium">Barangay:</span> {address.barangay_name}</p>
                    <p><span className="font-medium">Municipality:</span> {address.municipality_name}</p>
                    <p><span className="font-medium">Province:</span> {address.province_name}</p>
                    <p><span className="font-medium">Region:</span> {address.region_name}</p>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                    onClick={() => handleEdit(address)}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
                    >
                    Edit
                    </button>
                    <button
                    onClick={() => handleDelete(address.id)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                    Delete
                    </button>
                    {!address.is_default && (
                    <button
                        onClick={() => handleSetDefault(address.id)}
                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                    >
                        Set Default
                    </button>
                    )}
                </div>
                </div>
            ))}
            </div>

        </div>
    </div>
  )
}