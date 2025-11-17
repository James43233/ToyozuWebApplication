"use client"

import React, { useEffect, useState } from "react"

function EmployeesSection() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/users/")
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Search filter
  const filteredUsers = users.filter(
    (u) =>
      u.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  // Split by role_id
  const regularUsers = filteredUsers.filter((u) => u.role_id === 4)
  const employees = filteredUsers.filter((u) => [1, 2, 3].includes(u.role_id))

  // Handle role title update
  const handleRoleChange = async (userId, newRoleId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role_id: newRoleId }),
      })

      if (response.ok) {
        alert("Role updated successfully!")
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === userId ? { ...u, role_id: newRoleId } : u
          )
        )
      } else {
        alert("Failed to update role.")
      }
    } catch (error) {
      alert("Error updating role: " + error)
    }
  }

  if (loading) return <p className="text-center mt-10">Loading users...</p>

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg w-64"
        />
      </div>

      {/* ===================== Regular Users Table ===================== */}
      <div>
        <h3 className="text-xl font-semibold mb-3">All Users</h3>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {regularUsers.length > 0 ? (
                regularUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.user_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{u.role_name}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleRoleChange(u.user_id, 3)} // Example: promote to Employee
                      >
                        Promote to Employee
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan="4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== Employees/Admins Table ===================== */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Employees / Admins</h3>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.length > 0 ? (
                employees.map((u) => (
                  <tr key={u.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.user_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={u.role_id}
                        onChange={(e) =>
                          handleRoleChange(u.user_id, parseInt(e.target.value))
                        }
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value={1}>Admin</option>
                        <option value={2}>Secretary</option>
                        <option value={3}>Employee</option>
                        <option value={4}>User</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleRoleChange(u.user_id, 4)} // Demote to user
                      >
                        Demote to User
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan="4">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EmployeesSection
