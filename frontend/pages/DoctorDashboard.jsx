"use client";

import { useState, useEffect } from "react";
import {
  Calendar, Clock, User, Phone, FileText, AlertCircle, RefreshCw, Tag, Stethoscope,
  Loader2, LogOut, Send, Menu, X, CheckCircle
} from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(Number.parseInt(hours), Number.parseInt(minutes));
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const getStatusColor = (status) => {
  switch (status) {
    case "Upcoming": return "bg-blue-100 text-blue-800";
    case "Completed": return "bg-green-100 text-green-800";
    case "Cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [appointmentRefreshTrigger, setAppointmentRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("appointments");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportText, setReportText] = useState({});
  const [submittingReportId, setSubmittingReportId] = useState(null);

  useEffect(() => {
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      try {
        const parsedDoctor = JSON.parse(storedDoctor);
        setDoctor(parsedDoctor);
      } catch (error) {
        console.error("Error parsing doctor data from localStorage:", error);
        localStorage.removeItem("doctor");
        setDoctor(null);
      }
    }
    setPageLoading(false);
  }, []);

  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      if (!doctor?.doctorCode) {
        setAppointments([]);
        return;
      }
      setLoadingAppointments(true);
      try {
        const response = await fetch(
          `http://localhost:9000/api/doctor/appointments/${doctor.doctorCode}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setAppointments(result.appointments);
          const initialReports = {};
          result.appointments.forEach(app => {
            initialReports[app._id] = app.medicalReport || "";
          });
          setReportText(initialReports);
        } else {
          console.error("Failed to fetch doctor appointments:", result.message);
          setAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    if (doctor?.doctorCode) {
      fetchDoctorAppointments();
    }
  }, [doctor?.doctorCode, appointmentRefreshTrigger]);

  const handleLogout = () => {
    localStorage.removeItem("doctor");
    window.location.href = "/";
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:9000/api/appointments/${appointmentId}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      setAppointmentRefreshTrigger((prev) => prev + 1);
      alert("Appointment status updated!");
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const handleSubmitMedicalReport = async (appointmentId) => {
    setSubmittingReportId(appointmentId);
    try {
      const reportContent = reportText[appointmentId] || "";
      const response = await fetch(
        `http://localhost:9000/api/appointments/${appointmentId}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicalReport: reportContent }),
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      setAppointmentRefreshTrigger((prev) => prev + 1);
      alert("Medical report saved!");
    } catch (error) {
      console.error("Error saving medical report:", error);
      alert(`Failed to save report: ${error.message}`);
    } finally {
      setSubmittingReportId(null);
    }
  };

  const handleReportTextChange = (appointmentId, value) => {
    setReportText(prev => ({ ...prev, [appointmentId]: value }));
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "appointments": return "Your Appointments";
      case "patients": return "Your Patients";
      default: return "Doctor Dashboard";
    }
  };

  const navigationItems = [
    { id: "appointments", label: "Appointments", icon: Clock },
    { id: "patients", label: "Patients List", icon: User },
  ];

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium text-center">Loading doctor data...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Stethoscope className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Doctor data not found. Please login.</p>
          <button
            onClick={() => window.location.href = "/"}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff]">
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{getTabTitle()}</h1>
              <p className="text-sm text-gray-500">{doctor.name}</p>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {doctor.name.charAt(0)}
          </div>
        </div>
      </div>

      <div className="flex lg:grid lg:grid-cols-3">
        <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:col-span-1 lg:w-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="h-full overflow-y-auto bg-white border-r border-gray-100">
            <div className="p-4 lg:p-6">
              <div className="mb-6 lg:mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg lg:text-xl font-bold mr-3 lg:mr-4">
                    {doctor.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-800">{doctor.name}</h2>
                    <p className="text-sm text-gray-500">{doctor.department}</p>
                  </div>
                </div>
              </div>

              <nav className="mb-6">
                <div className="space-y-1 lg:space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <Icon className="h-4 w-4 lg:h-5 lg:w-5 mr-3" />
                        <span className="font-medium text-sm lg:text-base">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 lg:h-5 lg:w-5 mr-3" />
                <span className="font-medium text-sm lg:text-base">Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {sidebarOpen && (<div className="fixed inset-0 bg-[#222] bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />)}

        <div className="flex-1 lg:col-span-2 min-h-screen p-1 lg:p-[2px]">
          <div className="h-full overflow-y-auto bg-[#d5d5d5] rounded-none lg:rounded-3xl">
            <div className="p-4 lg:p-8">
              <div className="hidden lg:block mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-black">{getTabTitle()}</h1>
                <p className="text-black">Manage your appointments and patient records.</p>
              </div>

              <div>
                {activeTab === "appointments" && (
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg lg:text-xl font-semibold text-black">
                          Appointments for {doctor.name}
                        </h3>
                        <p className="text-gray-700 text-sm lg:text-base">
                          Total Appointments: {appointments.length}
                        </p>
                      </div>
                      <button
                        onClick={() => setAppointmentRefreshTrigger(prev => prev + 1)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm lg:text-base"
                      >
                        <RefreshCw className="h-4 w-4 mr-2 inline-block" /> Refresh Appointments
                      </button>
                    </div>

                    {loadingAppointments ? (
                      <div className="bg-white rounded-xl p-4 lg:p-6 text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                        <p className="text-gray-500 mt-2">Loading appointments...</p>
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="bg-[#fff] rounded-xl p-4 lg:p-6 text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No appointments scheduled for you.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <div key={appointment._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                                  <p className="text-sm text-gray-500">{appointment.patientRelation} • Token: {appointment.tokenNumber}</p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mt-3 border-t pt-3 border-gray-100">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{formatDate(appointment.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{formatTime(appointment.appointmentTime)}</span>
                              </div>
                              <div className="flex items-center space-x-2 col-span-full md:col-span-1">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{appointment.patientPhone}</span>
                              </div>
                            </div>

                            {appointment.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-start space-x-2">
                                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <p className="text-sm text-gray-600">Notes from employee: {appointment.notes}</p>
                                </div>
                              </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="font-medium text-gray-800 mb-2">Medical Report</h5>
                              <textarea
                                value={reportText[appointment._id] || ""}
                                onChange={(e) => handleReportTextChange(appointment._id, e.target.value)}
                                rows={3}
                                placeholder="Write medical observations and recommendations here..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                disabled={submittingReportId === appointment._id || appointment.status === "Completed" || appointment.status === "Cancelled"}
                              />
                              <div className="flex justify-end space-x-2 mt-2">
                                <button
                                  onClick={() => handleSubmitMedicalReport(appointment._id)}
                                  disabled={submittingReportId === appointment._id || appointment.status === "Completed" || appointment.status === "Cancelled"}
                                  className={`px-4 py-2 rounded-md text-white font-medium text-sm transition-colors ${submittingReportId === appointment._id || appointment.status === "Completed" || appointment.status === "Cancelled"
                                    ? "bg-purple-300 cursor-not-allowed"
                                    : "bg-purple-600 hover:bg-purple-700"
                                    }`}
                                >
                                  {submittingReportId === appointment._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin inline-block mr-1" />
                                  ) : (
                                    <Send className="h-4 w-4 inline-block mr-1" />
                                  )}
                                  Save Report
                                </button>
                                <select
                                  value={appointment.status}
                                  onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                                  disabled={appointment.status === "Completed" || appointment.status === "Cancelled"}
                                  className={`px-4 py-2 rounded-md font-medium text-sm border focus:outline-none focus:ring-2 focus:ring-green-500 ${appointment.status === "Completed" || appointment.status === "Cancelled"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-700"
                                    }`}
                                >
                                  <option value="Upcoming">Set Status</option>
                                  <option value="Completed">Mark Completed</option>
                                  <option value="Cancelled">Mark Cancelled</option>
                                </select>
                              </div>
                              {appointment.medicalReport && appointment.status === "Completed" && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Report submitted. This appointment is completed.
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "patients" && (
                  <div className="bg-white rounded-xl p-4 lg:p-6">
                    <div className="text-center py-8 lg:py-12">
                      <User className="h-12 w-12 lg:h-16 lg:w-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-600 text-base lg:text-lg">Patient list will appear here.</p>
                      <p className="text-gray-500 text-sm">
                        (Feature for displaying all patients you've consulted with)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;