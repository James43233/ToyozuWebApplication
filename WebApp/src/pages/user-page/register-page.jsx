"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/Arrival.png"

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // Form state
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    password: "",
    email: "",
    phone: "",
  })

  // Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // Handle register
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Always assign role_id = 4 for regular users
    const data = {
      user_name: form.fullname,
      username: form.username,
      password: form.password,
      email: form.email,
      mobile_phone: form.phone,
      role_id: 4, 
    }

    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const text = await response.text()
      let json
      try {
        json = JSON.parse(text)
      } catch {
        json = null
      }

      if (response.ok) {
        alert("Registration successful: " + text)
        navigate("/Start")
      } else {
        alert("Registration failed: " + (json ? JSON.stringify(json) : text))
      }
    } catch (error) {
      alert("An error occurred: " + error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 ">
        <div className="bg-card w-full shadow-2xl border border-gray-300 backdrop-blur-sm rounded-xl">
          {/* Header */}
          <div className="text-center pb-8">
            <div className="mt-[20px] mb-6">
              <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight text-[#eb0505]">
                <img src={logo} alt="Logo" className="h-[55px] inline-block mr-2" />
                TOYOZU
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
            </div>
            <div className="text-2xl font-semibold text-foreground">Create Account</div>
            <div className="text-muted-foreground">Register as a new user</div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullname" className="ml-[20px] text-foreground font-medium">
                Full Name
              </label>
              <div className="w-[400px] mx-auto">
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  placeholder="Enter full name"
                  value={form.fullname}
                  onChange={handleChange}
                  className="w-full h-12 px-3 border border-black rounded-sm"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="ml-[20px] text-foreground font-medium">
                Username
              </label>
              <div className="w-[400px] mx-auto">
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full h-12 px-3 border border-black rounded-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="ml-[20px] text-foreground font-medium">
                Password
              </label>
              <div className="relative w-[400px] mx-auto">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-12 px-3 pr-20 border border-black rounded-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-black"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="ml-[20px] text-foreground font-medium">
                Email
              </label>
              <div className="w-[400px] mx-auto">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full h-12 px-3 border border-black rounded-sm"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="ml-[20px] text-foreground font-medium">
                Phone
              </label>
              <div className="w-[400px] mx-auto">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full h-12 px-3 border border-black rounded-sm"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-[400px] flex justify-center items-center h-12 bg-[#eb0505] text-white font-semibold shadow-lg transition hover:shadow-xl hover:scale-105 rounded-sm"
              >
                Register
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center mb-8">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-primary hover:text-accent font-medium transition-colors"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Toyozu. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register;
