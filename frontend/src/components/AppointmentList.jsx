"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  AlertCircle,
  RefreshCw,
  Tag,
  Trash2,
  Stethoscope, // For doctor icon
} from "lucide-react";

const AppointmentList = ({ employeeCode, selectedPerson, refreshTrigger }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [doctorsMap, setDoctorsMap] = useState({}); // To map doctorCode to doctor name

  useEffect(() => {
    const fetchDoctorsForMap = async () => {
      try {
        const response = await fetch("http://localhost:9000/api/doctors");
        if (response.ok) {
          const result = await response.json();
          const map = {};
          result.doctors.forEach(doc => {
            map[doc.doctorCode] = doc.name;
          });
          setDoctorsMap(map);
        } else {
          console.error("Failed to fetch doctors for map:", response.status);
        }
      } catch (error) {
        console.error("Error fetching doctors for map:", error);
      }
    };
    fetchDoctorsForMap();
  }, []);

  const fetchAppointments = async () => {
    if (!employeeCode || !selectedPerson) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const encodedPatientName = encodeURIComponent(selectedPerson.name);
      const url = `http://localhost:9000/api/appointments?employeeCode=${employeeCode}&patientName=${encodedPatientName}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setAppointments(result.appointments);
      } else {
        setError(result.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      if (error.message.includes("Failed to fetch") || error.message.includes("ERR_CONNECTION_REFUSED")) {
        setError("Cannot connect to server. Please make sure your backend server is running.");
      } else {
        setError(`Failed to fetch appointments: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [employeeCode, selectedPerson?.name, refreshTrigger]);

  // This status update is only for employee's side (cancel button)
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:9000/api/appointments/${appointmentId}/update`, // Use the new update route
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        fetchAppointments();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert(`Failed to update appointment: ${error.message}`);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    const confirmed = confirm("Are you sure you want to delete this appointment? This action is irreversible.");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:9000/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        fetchAppointments();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert(`Failed to delete appointment: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true;
    return appointment.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm ">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Appointments for {selectedPerson?.name}
          </h3>
        </div>
        <div className="p-6 text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="lg:text-lg font-semibold text-gray-800">
            Appointments for {selectedPerson?.name}
          </h3>
        </div>
        <div className="p-6 text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchAppointments}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
            {error.includes("server") && (
              <p className="text-sm text-gray-500">
                Ensure backend server is running on port 9000.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Appointments for {selectedPerson?.name}
            </h3>
            <p className="text-sm text-gray-500">
              {selectedPerson?.relation} •{" "}
              {selectedPerson?.age ? `${selectedPerson.age} years old` : "Age not specified"}
            </p>
          </div>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {filter === "all"
                ? `No appointments found for ${selectedPerson?.name}`
                : `No ${filter} appointments found for ${selectedPerson?.name}`}
            </p>
            <p className="text-sm text-gray-400">
              Schedule a new appointment to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {appointment.patientName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {appointment.patientRelation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status}
                    </span>
                    <div className="flex space-x-1">
                      <select
                        value={appointment.status}
                        onChange={(e) =>
                          handleStatusUpdate(appointment._id, e.target.value)
                        }
                        disabled={appointment.status === "Cancelled" || appointment.status === "Completed"}
                        className={`text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${appointment.status === "Cancelled" || appointment.status === "Completed"
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : ""
                          }`}
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
                        <button
                          onClick={() => {
                            const confirmed = confirm("Are you sure you want to cancel this appointment?");
                            if (confirmed) {
                              handleStatusUpdate(appointment._id, "Cancelled");
                            }
                          }}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      {appointment.status === "Cancelled" && (
                        <button
                          onClick={() => handleDeleteAppointment(appointment._id)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          title="Delete cancelled appointment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatTime(appointment.appointmentTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4 text-gray-400" />
                    <span>{doctorsMap[appointment.doctorCode] || appointment.doctorCode}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>({appointment.patientPhone})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span>Token: {appointment.tokenNumber}</span>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-600">
                        Notes: {appointment.notes}
                      </p>
                    </div>
                  </div>
                )}
                {appointment.medicalReport && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-purple-600 mt-0.5" />
                      <p className="text-sm text-purple-800 font-medium">
                        Medical Report: {appointment.medicalReport}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentList;