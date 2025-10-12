"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/Arrival.png"
import emailLogo from "../assets/download.png"
import passLogo from "../assets/password icon.png"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  // MFA related states
  const [mfaModalOpen, setMfaModalOpen] = useState(false)
  const [mfaCode, setMfaCode] = useState("")
  const [verifyingMfa, setVerifyingMfa] = useState(false)
  const [mfaError, setMfaError] = useState("")
  const [pendingRoleId, setPendingRoleId] = useState(null)
  const [mfaMethod, setMfaMethod] = useState("email")
  const [mfaStep, setMfaStep] = useState(0)
  const [userEmail, setUserEmail] = useState("")
  const [userPhone, setUserPhone] = useState("")

  // Determine if input is email
  const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)

  // --- LOGIN SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault()

    const loginPayload = isEmail(emailOrUsername)
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password }

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginPayload),
      })

      const data = await response.json()

      if (response.ok) {
        // If OTP required, open MFA modal
        if (data.otp_required) {
          if (data.role_id) setPendingRoleId(data.role_id)
          setUserEmail(data.email || "No email on file")
          setUserPhone(data.phone || "No phone on file")
          setMfaModalOpen(true)
          setMfaStep(0)
        }
      } else {
        alert(data.error || data.detail || "Login failed.")
      }
    } catch (error) {
      console.error("Error during login:", error)
      alert("Something went wrong. Please try again.")
    }
  }

  // --- SEND OTP ---
  const handleSendOtp = async (method) => {
    setMfaMethod(method)
    setMfaStep(1)
    setMfaError("")
    // (You can call your backend here to send OTP)
  }

  // --- VERIFY MFA ---
  const handleMfaVerify = async (e) => {
    e.preventDefault()
    setVerifyingMfa(true)
    setMfaError("")

    const usernameForMfa = emailOrUsername

    try {
      const response = await fetch("http://localhost:8000/api/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameForMfa, token: mfaCode, method: mfaMethod }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ Login success — backend response:", data);

        // Save tokens
        if (data.access) localStorage.setItem("access_token", data.access);
        if (data.refresh) localStorage.setItem("refresh_token", data.refresh);

        // Save role
        const roleIdToStore = data.role_id || pendingRoleId;
        if (roleIdToStore) localStorage.setItem("role_id", roleIdToStore);

        // ✅ Fix: If backend doesn't return user_id, create user object from available fields
        const userData = {
          user_id: data.user_id || data.id || data.pk || null, // fallback chain
          username: data.username || "",
          email: data.email || "",
          role_id: roleIdToStore || data.role_id || null,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        if (userData.user_id) localStorage.setItem("user_id", userData.user_id);

        console.log("✅ Login success — stored user object:", userData);

        setMfaModalOpen(false);
        setMfaCode('');
        setMfaStep(0);
        redirectByRole(roleIdToStore);
      } else {
        setMfaError(data.error || data.detail || "Invalid MFA code.");
      }

    } catch (error) {
      console.error("❌ MFA verification failed:", error)
      setMfaError("Something went wrong. Please try again.")
    }
    setVerifyingMfa(false)
  }

  // --- REDIRECT BASED ON ROLE ---
  const redirectByRole = (roleId) => {
    const id = parseInt(roleId, 10)
    if (id === 1) navigate("/AdminDashboard")
    else navigate("/Start")
  }

  console.log("Saved role_id:", localStorage.getItem("role_id"))



  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 ">
            <div className="bg-card w-full shadow-2xl border border-gray-300 backdrop-blur-sm rounded-xl">
                <div className="text-center pb-8">
                    <div className="mt-[20px] mb-6">
                    <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight text-[#eb0505]">
                        <img src={logo} alt="Logo" className="h-[55px] inline-block mr-2" />
                        TOYOZU
                    </h1>
                    <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
                    </div>
                    <div className="text-2xl font-semibold text-foreground ">Welcome Back</div>
                    <div className="text-muted-foreground">Sign in to your Toyozu account</div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 ">
                    <label htmlFor="emailOrUsername" className="ml-[20px] text-foreground font-medium">
                        Email or Username
                    </label>
                    <div className="relative w-[400px] mx-auto">
                            <input
                                id="emailOrUsername"
                                type="text"
                                placeholder="Enter your email or username"
                                value={emailOrUsername}
                                onChange={(e) => setEmailOrUsername(e.target.value)}
                                className="w-full h-12 pl-10 pr-3 border border-black rounded-sm"
                                required
                            />
                            <img
                                src={emailLogo}
                                alt="Email Icon"
                                className="h-5 w-5 absolute left-2 top-1/2 -translate-y-1/2"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                    <label htmlFor="password" className="ml-[20px] text-foreground font-medium">
                        Password
                    </label>
                    <div className="relative w-[400px] mx-auto">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 pl-10 pr-20 border border-black rounded-sm"
                                required
                            />
                            <img
                                src={passLogo}
                                alt="Password Icon"
                                className="h-[15px] w-[20px] absolute left-2 top-1/2 -translate-y-1/2"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-black"
                                tabIndex={-1}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mx-auto w-[400px]">
                    <div className="flex items-center space-x-2">
                        <input
                        id="remember"
                        type="checkbox"
                        className="rounded border-border text-primary focus:ring-primary/20"
                        />
                        <label htmlFor="remember" className="text-sm text-muted-foreground">
                        Remember me
                        </label>
                    </div>
                    <a href="#" className="text-sm text-primary hover:text-accent font-medium transition-colors">
                        Forgot password?
                    </a>
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="w-[400px] flex justify-center items-center h-12 bg-[#eb0505] text-white font-semibold shadow-lg transition hover:shadow-xl hover:scale-105 rounded-sm"
                            >
                            Sign In
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center mb-8">
                    <p className="text-muted-foreground">
                    Don't have an account?{" "}
                    <a href="#" className="text-primary hover:text-accent font-medium transition-colors">
                        Sign up here
                    </a>
                    </p>
                </div>
            </div>
            <div className="mt-8 text-center">
                <p className="text-muted-foreground text-sm">© 2024 Toyozu. All rights reserved.</p>
            </div>
      </div>

      {/* MFA Modal */}
      {mfaModalOpen && (
        <MFAModal
          mfaStep={mfaStep}
          setMfaStep={setMfaStep}
          mfaMethod={mfaMethod}
          setMfaMethod={setMfaMethod}
          onSendOtp={handleSendOtp}
          mfaCode={mfaCode}
          setMfaCode={setMfaCode}
          mfaError={mfaError}
          verifyingMfa={verifyingMfa}
          onClose={() => {
            setMfaModalOpen(false);
            setMfaStep(0);
            setMfaError('');
            setMfaCode('');
          }}
          onVerify={handleMfaVerify}
          userEmail={userEmail}
          userPhone={userPhone}
        />
      )}
    </div>
  )
}

// MFA Modal component with method selection
function MFAModal({
  mfaStep, mfaMethod, setMfaMethod, onSendOtp,
  mfaCode, setMfaCode, mfaError, verifyingMfa, onClose, onVerify,
  userEmail, userPhone
}) {
  if (mfaStep === 0) {
    return (
      <div className="fixed inset-0 flex items-start justify-center pt-[50px] bg-white/30 backdrop-blur-md z-50">
        <div className="bg-white p-8 rounded-xl w-[400px] shadow-2xl border border-gray-300">
            <h2 className="text-2xl font-bold mb-4 text-[#eb0505] text-center">Choose MFA Method</h2>
            <p className="mb-6 text-sm text-center text-gray-700">
            Where do you want to receive your verification code?
            </p>
            <div className="flex flex-col gap-3">
            <button
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                mfaMethod === 'email' 
                    ? 'bg-[#eb0505] text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onSendOtp('email')}
            >
                📧 Send to Email
            </button>
            <button
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                mfaMethod === 'phone' 
                    ? 'bg-[#eb0505] text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onSendOtp('phone')}
            >
                📱 Send to Phone
            </button>
            <button
                className="px-6 py-3 bg-gray-400 text-white rounded-lg mt-4 hover:bg-gray-500 transition-all"
                onClick={onClose}
            >
                Cancel
            </button>
            </div>
        </div>
    </div>

    );
  }
  
  // Step 1: Enter code
  return (
    <div className="fixed inset-0 flex items-start justify-center pt-[50px] bg-white-500/30 backdrop-blur-md z-50">
      <div className="bg-white p-8 rounded-xl w-[400px] shadow-2xl border border-gray-300">
        <h2 className="text-2xl font-bold mb-4 text-[#eb0505] text-center">Multi-Factor Authentication</h2>
        <p className="mb-6 text-sm text-center text-gray-700">
          A verification code has been sent to your {mfaMethod}.
          <br />Please enter it below to continue.
        </p>
        <form onSubmit={onVerify} className="space-y-4">
          <input
            type="text"
            placeholder="Enter MFA Code"
            className="w-full p-4 border border-gray-300 rounded-lg text-black text-center text-lg tracking-widest"
            value={mfaCode}
            onChange={e => setMfaCode(e.target.value)}
            disabled={verifyingMfa}
            maxLength={6}
          />
          {mfaError && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {mfaError}
            </div>
          )}
          <div className="flex justify-center gap-3 mt-6">
            <button
              type="button"
              className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"
              onClick={onClose}
              disabled={verifyingMfa}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[#eb0505] text-white rounded-lg hover:bg-red-600 transition-all shadow-lg disabled:opacity-50"
              disabled={verifyingMfa}
            >
              {verifyingMfa ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}