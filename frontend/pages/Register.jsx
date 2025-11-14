"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Calendar,
  Users,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  LockIcon
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [employeeFirstName, setEmployeeFirstName] = useState("");
  const [employeeLastName, setEmployeeLastName] = useState("");
  const [employeeGender, setEmployeeGender] = useState("");
  const [employeeDOB, setEmployeeDOB] = useState("");
  const [employeePhoneNumber, setEmployeeNumber] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [dependents, setDependents] = useState([]);
  const [registerStatus, setRegisterStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDependent = () => {
    setDependents([...dependents, { name: "", gender: "", dob: "", relation: "" }]);
  };

  const handleRemoveDependent = (index) => {
    const updated = [...dependents];
    updated.splice(index, 1);
    setDependents(updated);
  };

  const handleDependentChange = (index, field, value) => {
    const updated = [...dependents];
    updated[index][field] = value;
    setDependents(updated);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const employeeData = {
      employeeFirstName,
      employeeLastName,
      employeeGender,
      employeeDOB,
      employeePhoneNumber,
      employeeCode,
      employeePassword, // Ensure password is sent
      dependents,
    };
    try {
      const response = await fetch("http://localhost:9000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });
      const result = await response.json();
      if (response.ok) {
        // Check response.ok for success (status 2xx)
        setRegisterStatus("success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setRegisterStatus("error");
        // Log the actual error message from the backend if available
        console.error("Backend error during registration:", result.error || result.message);
      }
    } catch (error) {
      console.error("Registration failed (network or unexpected error)", error);
      setRegisterStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleRegister} className="space-y-8">
            {/* Employee Information Section */}
            <div className="bg-[#333] px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <User className="h-6 w-6" />
                <span>Employee Information</span>
              </h2>
              <p className="text-slate-200 mt-1">Please provide your personal details</p>
            </div>
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#333] flex items-center space-x-2">
                    <User className="h-4 w-4 text-[#333]" />
                    <span>Employee Code</span>
                  </label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200 outline-none"
                    placeholder="Enter your Employee Code"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#333] flex items-center space-x-2">
                    <LockIcon className="h-4 w-4 text-[#333]" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    value={employeePassword}
                    onChange={(e) => setEmployeePassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200 outline-none"
                    placeholder="Enter your password"
                    minLength={8}
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#333] flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-[#333]" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="text"
                    value={employeePhoneNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200 outline-none"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    required
                  />
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#333]">First Name</label>
                  <input
                    type="text"
                    value={employeeFirstName}
                    onChange={(e) => setEmployeeFirstName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200 outline-none"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#333]">Last Name</label>
                  <input
                    type="text"
                    value={employeeLastName}
                    onChange={(e) => setEmployeeLastName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200 outline-none"
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#333]">Gender</label>
                  <select
                    value={employeeGender}
                    onChange={(e) => setEmployeeGender(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200 outline-none bg-white"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#333] flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-[#333]" />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    value={employeeDOB}
                    onChange={(e) => setEmployeeDOB(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200 outline-none"
                    required
                  />
                </div>


              </div>
            </div>

            {/* Dependents Section */}
            <div className="border-t border-gray-200">
              <div className="bg-[#333] px-8 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <Users className="h-6 w-6" />
                  <span>Family Members</span>
                </h3>
                <p className="text-gray-200 mt-1">
                  Add your dependents who will be covered under healthcare
                </p>
              </div>

              <div className="px-8 py-6 space-y-6">
                {dependents.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No family members added yet</p>
                    <p className="text-gray-400">Click the button below to add your first dependent</p>
                  </div>
                )}

                {dependents.map((dep, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                        <Users className="h-5 w-5 text-[#333]" />
                        <span>Family Member {index + 1}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveDependent(index)}
                        className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#333]">Full Name</label>
                        <input
                          type="text"
                          value={dep.name}
                          onChange={(e) => handleDependentChange(index, "name", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200 outline-none"
                          placeholder="Enter full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#333]">Gender</label>
                        <select
                          value={dep.gender}
                          onChange={(e) => handleDependentChange(index, "gender", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200 outline-none bg-white"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#333]">Date of Birth</label>
                        <input
                          type="date"
                          value={dep.dob}
                          onChange={(e) => handleDependentChange(index, "dob", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200 outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#333]">Relationship</label>
                        <select
                          value={dep.relation}
                          onChange={(e) => handleDependentChange(index, "relation", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200 outline-none bg-white"
                          required >
                          <option value="">Select Relationship</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Wife">Wife</option>
                          <option value="Mother">Mother</option>
                          <option value="Father">Father</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddDependent}
                  className="w-full flex items-center justify-center space-x-3 bg-[#333] hover:bg-[#111] text-white font-semibold py-4 rounded-xl transition-all duration-200"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Family Member</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-8 pb-8 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full flex items-center justify-center space-x-3 bg-[#333] hover:bg-[#111] text-white font-bold py-4 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Already Registered? Login</span>
              </button>

              {/* Status Messages */}
              {registerStatus === "success" && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-green-800 font-semibold">Registration Successful!</p>
                      <p className="text-green-600">Redirecting to login page...</p>
                    </div>
                  </div>
                </div>
              )}

              {registerStatus === "error" && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <div>
                      <p className="text-red-800 font-semibold">Registration Failed</p>
                      <p className="text-red-600">Please check your information and try again.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-gray-500">© 2025 Bharat Coking Coal Limited. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Register;