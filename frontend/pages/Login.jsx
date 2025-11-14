"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeLoginForm from "../src/components/EmployeeLoginForm";
import DoctorLoginForm from "../src/components/DoctorLoginForm";

const Login = () => {
  const [mode, setMode] = useState("employee");
  const [employeeId, setEmployeeId] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [doctorCode, setDoctorCode] = useState("");
  const [loginStatus, setLoginStatus] = useState(null);
  const navigate = useNavigate();

  const handleEmployeeLogin = async (e) => {
    e.preventDefault();
    setLoginStatus("loading");
    try {
      const response = await fetch("http://localhost:9000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeCode: employeeId, password: employeePassword }),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("employee", JSON.stringify(result.employee));
        setLoginStatus("success");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setLoginStatus("error");
        console.error("Employee login failed:", result.message || result.error);
      }
    } catch (error) {
      console.error("Login request failed:", error);
      setLoginStatus("error");
    }
  };

  const handleDoctorLogin = async (e, submittedDoctorCode, submittedPassword) => {
    e.preventDefault();
    setLoginStatus("loading");
    try {
      const response = await fetch("http://localhost:9000/doctor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorCode: submittedDoctorCode, password: submittedPassword }),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("doctor", JSON.stringify(result.doctor));
        setLoginStatus("success");
        setTimeout(() => navigate("/doctor-dashboard"), 1000);
      } else {
        setLoginStatus("error");
        console.error("Doctor login failed:", result.message || result.error);
      }
    } catch (error) {
      console.error("Doctor login request failed:", error);
      setLoginStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden">
        <div className="relative h-48 sm:h-64">
          <img src="./BCCL.jpg" alt="BCCL" className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-xl sm:text-2xl font-bold mb-2">BHARAT COKING COAL LIMITED</h1>
              {/* <h1 className="text-xl sm:text-2xl font-bold mb-2">Rajendra Institute of Medical Sciences, Ranchi</h1> */}
              <p className="text-sm opacity-90">Login as Employee or Doctor</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex space-x-2 sm:space-x-4">
              <button
                onClick={() => setMode("employee")}
                className={`flex-1 py-2 sm:py-3 rounded-md font-semibold text-sm sm:text-base transition-colors ${mode === "employee" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}>
                Employee
              </button>
              <button
                onClick={() => setMode("admin")}
                className={`flex-1 py-2 sm:py-3 rounded-md font-semibold text-sm sm:text-base transition-colors ${mode === "admin" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}>
                Doctor
              </button>
            </div>

            <div>
              {mode === "employee" ? (
                <EmployeeLoginForm
                  employeeId={employeeId}
                  setEmployeeId={setEmployeeId}
                  employeePassword={employeePassword}
                  setEmployeePassword={setEmployeePassword}
                  onSubmit={handleEmployeeLogin}
                  loginStatus={loginStatus}
                  navigate={navigate}
                />
              ) : (
                <DoctorLoginForm
                  doctorCode={doctorCode}
                  setDoctorCode={setDoctorCode}
                  onSubmit={handleDoctorLogin}
                  loginStatus={loginStatus}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-4 lg:min-h-screen">
        <div className="col-span-2 overflow-y-auto flex flex-col justify-center items-center p-6 xl:p-8 scrollbar-hide">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h1 className="text-2xl xl:text-3xl font-bold text-gray-800 leading-tight">BHARAT COKING COAL LIMITED</h1>
              <h1 className="text-2xl xl:text-3xl font-bold text-gray-800 leading-tight">Bharat Coking Coal Limited, Dhanbad</h1>
              <p className="text-sm text-gray-500 mt-2">Login as Employee or Doctor</p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setMode("employee")}
                className={`w-1/2 py-2 xl:py-3 rounded-md font-semibold transition-colors ${mode === "employee" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}
              >
                Employee
              </button>
              <button
                onClick={() => setMode("admin")}
                className={`w-1/2 py-2 xl:py-3 rounded-md font-semibold transition-colors ${mode === "admin" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}
              >
                Doctor
              </button>
            </div>

            <div>
              {mode === "employee" ? (
                <EmployeeLoginForm
                  employeeId={employeeId}
                  setEmployeeId={setEmployeeId}
                  employeePassword={employeePassword}
                  setEmployeePassword={setEmployeePassword}
                  onSubmit={handleEmployeeLogin}
                  loginStatus={loginStatus}
                  navigate={navigate}
                />
              ) : (
                <DoctorLoginForm
                  doctorCode={doctorCode}
                  setDoctorCode={setDoctorCode}
                  onSubmit={handleDoctorLogin}
                  loginStatus={loginStatus}
                />
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 min-h-screen p-[2px]">
          <div className="h-screen overflow-hidden rounded-3xl flex items-center">
            <img
              src="https://img-cdn.publive.online/fit-in/1200x675/jobs-sentinalassam/media/media_files/2025/06/11/PxN0mpVySjsFfgXjXWlg.jpg"
              alt="BCCL"
              className="object-contain w-[90%] h-[90%]  rounded-3xl transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;