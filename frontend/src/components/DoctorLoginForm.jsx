"use client";

import { useState } from "react";
import { User, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const DoctorLoginForm = ({
  doctorCode,
  setDoctorCode,
  onSubmit,
  loginStatus,
}) => {
  const [password, setPassword] = useState("");

  const handleDoctorSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, doctorCode, password);
  };

  return (
    <form onSubmit={handleDoctorSubmit} className="space-y-6">

      {/* Doctor Code Input */}
      <div>
        <label htmlFor="doctorCode" className="block text-lg font-medium text-gray-700 mb-2">
          Doctor Code
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={doctorCode}
            onChange={(e) => setDoctorCode(e.target.value)}
            type="text"
            id="doctor_code"
            name="doctorCode"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Doctor Code"
            required
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="doctorPassword" className="block text-lg font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="doctor_password"
            name="doctorPassword"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Password"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loginStatus === "loading"}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition duration-200 flex items-center justify-center space-x-2"
      >
        {loginStatus === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          <span>Login</span>
        )}
      </button>

      {loginStatus === "success" && (
        <p className="text-green-600 text-center mt-4 flex items-center justify-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Login Successful! Redirecting...</span>
        </p>
      )}
      {loginStatus === "error" && (
        <p className="text-red-600 text-center mt-4 flex items-center justify-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Invalid Doctor Code or Password.</span>
        </p>
      )}
    </form>
  );
};

export default DoctorLoginForm;