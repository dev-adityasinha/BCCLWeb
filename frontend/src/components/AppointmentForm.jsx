"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

const AppointmentForm = ({ isOpen, onClose, allPersons, employeeCode, onAppointmentCreated }) => {
  const [appointmentForm, setAppointmentForm] = useState({
    dependentIndex: 0,
    appointmentDate: "",
    doctorCode: "",
    notes: "",
  });
  const [allDoctors, setAllDoctors] = useState([]); // Stores all fetched doctors
  const [filteredDoctors, setFilteredDoctors] = useState([]); // Doctors available on selected date
  const [selectedDoctorTimings, setSelectedDoctorTimings] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [errorFetchingDoctors, setErrorFetchingDoctors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAppointmentPerson = allPersons[appointmentForm.dependentIndex];

  // Effect 1: Fetch all doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await fetch("http://localhost:9000/api/doctors");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setAllDoctors(result.doctors);
          // Initialize filteredDoctors with all doctors here, directly after fetching
          setFilteredDoctors(result.doctors);
        } else {
          setErrorFetchingDoctors(result.message || "Failed to fetch doctors");
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setErrorFetchingDoctors("Failed to load doctors. Please try again later.");
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []); // Runs only once on mount

  // Effect 2: Filter doctors based on selected date
  useEffect(() => {
    if (allDoctors.length > 0) {
      if (appointmentForm.appointmentDate) {
        const selectedDate = new Date(appointmentForm.appointmentDate);
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

        const doctorsAvailableOnDate = allDoctors.filter(doctor =>
          doctor.availableDays.includes(dayOfWeek)
        );
        setFilteredDoctors(doctorsAvailableOnDate);

        // If the previously selected doctor is no longer available, reset selection
        if (appointmentForm.doctorCode && !doctorsAvailableOnDate.some(doc => doc.doctorCode === appointmentForm.doctorCode)) {
          setAppointmentForm(prev => ({ ...prev, doctorCode: "" }));
        }
      } else {
        // If no date is selected, show all doctors that were initially fetched
        setFilteredDoctors(allDoctors);
      }
    }
    // Also reset timings/doctorCode if date changes or is cleared
    setSelectedDoctorTimings("");
    // We don't necessarily reset doctorCode here as the above 'if' condition handles it based on availability
  }, [appointmentForm.appointmentDate, allDoctors, appointmentForm.doctorCode]);

  // Effect 3: Update selected doctor's timings display
  useEffect(() => {
    if (appointmentForm.doctorCode && allDoctors.length > 0) {
      const selectedDoc = allDoctors.find(doc => doc.doctorCode === appointmentForm.doctorCode);
      if (selectedDoc) {
        setSelectedDoctorTimings(selectedDoc.timings);
      } else {
        setSelectedDoctorTimings("");
      }
    } else {
      setSelectedDoctorTimings("");
    }
  }, [appointmentForm.doctorCode, allDoctors]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!appointmentForm.appointmentDate || !appointmentForm.doctorCode || !selectedDoctorTimings) {
      alert("Please select an appointment date and a doctor with available timings.");
      setIsSubmitting(false);
      return;
    }

    try {
      const appointmentData = {
        employeeCode,
        patientName: selectedAppointmentPerson.name,
        patientAge: selectedAppointmentPerson.age || 0,
        patientGender: selectedAppointmentPerson.gender,
        patientRelation: selectedAppointmentPerson.relation,
        patientPhone: selectedAppointmentPerson.phone,
        patientAddress: selectedAppointmentPerson.address,
        appointmentDate: appointmentForm.appointmentDate,
        appointmentTime: selectedDoctorTimings.split(' ')[0], // Using the start time from doctor's timings
        doctorCode: appointmentForm.doctorCode,
        notes: appointmentForm.notes,
      };

      const response = await fetch("http://localhost:9000/api/appointments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (result.success) {
        alert("Appointment scheduled successfully!");
        setAppointmentForm({
          dependentIndex: 0,
          appointmentDate: "",
          doctorCode: "",
          notes: "",
        });
        onClose();
        if (onAppointmentCreated) {
          onAppointmentCreated();
        }
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to create appointment. Please check if your backend server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" data-lenis-prevent>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Schedule New Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Dependent</label>
                <div className="relative">
                  <select
                    value={appointmentForm.dependentIndex}
                    onChange={(e) =>
                      setAppointmentForm({
                        ...appointmentForm,
                        dependentIndex: Number.parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    disabled={isSubmitting}
                  >
                    {allPersons.map((person, index) => (
                      <option key={index} value={index}>
                        {person.name} ({person.relation})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={selectedAppointmentPerson.name}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Age</label>
                    <input
                      type="text"
                      value={selectedAppointmentPerson.age ? `${selectedAppointmentPerson.age} years` : "N/A"}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Gender</label>
                    <input
                      type="text"
                      value={selectedAppointmentPerson.gender}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Relation</label>
                    <input
                      type="text"
                      value={selectedAppointmentPerson.relation}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Phone</label>
                    <input
                      type="text"
                      value={selectedAppointmentPerson.phone}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Address</label>
                    <textarea
                      value={selectedAppointmentPerson.address}
                      readOnly
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date *</label>
                <input
                  type="date"
                  value={appointmentForm.appointmentDate}
                  onChange={(e) =>
                    setAppointmentForm({
                      ...appointmentForm,
                      appointmentDate: e.target.value,
                      doctorCode: "", // Reset doctor selection when date changes
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor *</label>
                <div className="relative">
                  {loadingDoctors ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-500 bg-gray-50">Loading doctors...</div>
                  ) : errorFetchingDoctors ? (
                    <div className="w-full px-3 py-2 border border-red-300 rounded-md text-red-600 bg-red-50">{errorFetchingDoctors}</div>
                  ) : (
                    <>
                      <select
                        value={appointmentForm.doctorCode}
                        onChange={(e) =>
                          setAppointmentForm({
                            ...appointmentForm,
                            doctorCode: e.target.value,
                          })
                        }
                        required
                        disabled={isSubmitting || !appointmentForm.appointmentDate} // Disable if no date selected
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">
                          {appointmentForm.appointmentDate && filteredDoctors.length > 0 ? "Choose a doctor..." : appointmentForm.appointmentDate ? "No doctors available on this date" : "Select date first"}
                        </option>
                        {filteredDoctors.map((doctor) => (
                          <option key={doctor.doctorCode} value={doctor.doctorCode}>
                            {doctor.name} - {doctor.department}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </>
                  )}
                </div>
                {selectedDoctorTimings && (
                  <p className="mt-2 text-sm text-gray-600">
                    Available: {selectedDoctorTimings}
                  </p>
                )}
                {!appointmentForm.appointmentDate && (
                  <p className="mt-2 text-sm text-red-500">Please select an appointment date first to see available doctors.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                <textarea
                  value={appointmentForm.notes}
                  onChange={(e) =>
                    setAppointmentForm({
                      ...appointmentForm,
                      notes: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Any specific symptoms, concerns, or additional information..."
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;