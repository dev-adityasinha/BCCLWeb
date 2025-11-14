"use client"

import { useState, useEffect } from "react"
import { User, Calendar, LogOut, FileText, Loader2, Home, Clock, Settings, ChevronDown, Menu, X } from "lucide-react"
import AppointmentForm from "../src/components/AppointmentForm"
import AppointmentList from "../src/components/AppointmentList"

// Calculate age from DOB
function calculateAge(dob) {
  if (!dob) return null
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!hasHadBirthdayThisYear) age--
  return age
}

function Dashboard() {
  const [employee, setEmployee] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [appointmentRefreshTrigger, setAppointmentRefreshTrigger] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const storedEmployee = localStorage.getItem("employee")
    if (storedEmployee) {
      try {
        const parsedEmployee = JSON.parse(storedEmployee)
        setEmployee(parsedEmployee)
      } catch (error) {
        console.error("Error parsing employee data from localStorage:", error)
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("employee")
    window.location.href = "/"
  }

  const handleAppointmentCreated = () => {
    setAppointmentRefreshTrigger((prev) => prev + 1)
  }

  const handleProfileSwitch = (index) => {
    setSelectedIndex(index)
    setShowProfileMenu(false)
    setAppointmentRefreshTrigger((prev) => prev + 1)
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSidebarOpen(false) // Close sidebar on mobile when tab changes
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium text-center">Loading employee data...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No employee data found</p>
        </div>
      </div>
    )
  }

  const fullName = `${employee.employeeFirstName} ${employee.employeeLastName}`
  const allPersons = [
    {
      name: fullName,
      gender: employee.employeeGender,
      relation: "Self",
      age: calculateAge(employee.employeeDOB),
      dob: employee.employeeDOB,
      phone: employee.employeePhoneNumber,
      address: employee.employeeAddress || "BCCL Township, Dhanbad, Jharkhand, India",
    },
    ...(employee.dependents || []).map((dep) => ({
      name: dep.name,
      gender: dep.gender,
      relation: dep.relation,
      age: calculateAge(dep.dob),
      dob: dep.dob,
      phone: dep.phone || employee.employeePhoneNumber,
      address: dep.address || "BCCL Township, Dhanbad, Jharkhand, India",
    })),
  ]

  const selectedPerson = allPersons[selectedIndex]

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const navigationItems = [
    {
      id: "home",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "schedule",
      label: "Appointments",
      icon: Clock,
    },
    {
      id: "reports",
      label: "Medical Records",
      icon: FileText,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  const getTabTitle = () => {
    switch (activeTab) {
      case "home":
        return "Dashboard"
      case "schedule":
        return "Appointments"
      case "reports":
        return "Medical Records"
      case "settings":
        return "Settings"
      default:
        return "Dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-[#fff]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{getTabTitle()}</h1>
              <p className="text-sm text-gray-500">{selectedPerson.name}</p>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {selectedPerson.name.charAt(0)}
            {selectedPerson.name.split(" ").length > 1 ? selectedPerson.name.split(" ")[1].charAt(0) : ""}
          </div>
        </div>
      </div>

      <div className="flex lg:grid lg:grid-cols-3">
        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-80  transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:col-span-1 lg:w-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="h-full overflow-y-auto">
            <div className="p-4 lg:p-6">
              {/* Profile Section */}
              <div className="mb-6 lg:mb-8">
                {/* Profile Avatar and Info */}
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg lg:text-xl font-bold mr-3 lg:mr-4">
                    {selectedPerson.name.charAt(0)}
                    {selectedPerson.name.split(" ").length > 1 ? selectedPerson.name.split(" ")[1].charAt(0) : ""}
                  </div>
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-800">{selectedPerson.name}</h2>
                    <p className="text-sm text-green-600 flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      {selectedPerson.relation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="mb-6">
                <div className="space-y-1 lg:space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={`w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <Icon className="h-4 w-4 lg:h-5 lg:w-5 mr-3" />
                        <span className="font-medium text-sm lg:text-base">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </nav>

              {/* Profile Switcher */}
              <div className="mb-4">
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-full flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs lg:text-sm font-medium mr-3">
                        {selectedPerson.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-xs lg:text-sm font-medium text-gray-800">{selectedPerson.name}</p>
                        <p className="text-xs text-gray-500">{selectedPerson.relation}</p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="p-2">
                        <p className="text-sm font-medium px-3 py-2">Switch Profile</p>
                        {allPersons.map((person, index) => (
                          <button
                            key={index}
                            className={`w-full flex items-center px-3 py-2 hover:bg-gray-50 rounded-md text-left ${selectedIndex === index ? "bg-blue-50 border border-blue-200" : ""
                              }`}
                            onClick={() => handleProfileSwitch(index)}
                          >
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-3">
                              {person.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{person.name}</p>
                              <p className="text-xs text-gray-500">{person.relation}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Logout Button */}
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

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-[#222] bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:col-span-2 min-h-screen p-1 lg:p-[2px]">
          <div className="h-full overflow-y-auto bg-[#d5d5d5] rounded-none lg:rounded-3xl">
            <div className="p-4 lg:p-8">
              {/* Desktop Header */}
              <div className="hidden lg:block mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-black">{getTabTitle()}</h1>
                <p className="text-black">Managing healthcare for {selectedPerson.name}</p>
              </div>

              {/* Content Area */}
              <div>
                {activeTab === "home" && (
                  <div className="space-y-4 lg:space-y-6">
                    {/* Patient Information Card */}
                    <div className="bg-[#fff] rounded-xl p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-semibold mb-4">Patient Information</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div className="space-y-3 lg:space-y-4">
                          <div>
                            <p className="text-gray-600 text-sm">Full Name</p>
                            <p className="text-black font-medium">{selectedPerson.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Gender</p>
                            <p className="text-black font-medium">{selectedPerson.gender}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Age</p>
                            <p className="text-black font-medium">
                              {selectedPerson.age !== null ? `${selectedPerson.age} years old` : "DOB not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3 lg:space-y-4">
                          <div>
                            <p className="text-gray-600 text-sm">Phone Number</p>
                            <p className="text-black font-medium">{selectedPerson.phone}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Relation</p>
                            <p className="text-black font-medium">{selectedPerson.relation}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Date of Birth</p>
                            <p className="text-black font-medium">{formatDate(selectedPerson.dob)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#fff] rounded-xl p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-semibold mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                        <button
                          onClick={() => setShowAppointmentForm(true)}
                          className="p-3 lg:p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-center text-white"
                        >
                          <Calendar className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-2" />
                          <p className="font-medium text-sm lg:text-base">Schedule Appointment</p>
                          <p className="text-xs lg:text-sm text-green-200">Book new appointment</p>
                        </button>
                        <button
                          onClick={() => handleTabChange("schedule")}
                          className="p-3 lg:p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center text-white"
                        >
                          <Clock className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-2" />
                          <p className="font-medium text-sm lg:text-base">View Appointments</p>
                          <p className="text-xs lg:text-sm text-blue-200">Manage appointments</p>
                        </button>
                        <button
                          onClick={() => handleTabChange("reports")}
                          className="p-3 lg:p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-center text-white"
                        >
                          <FileText className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-2" />
                          <p className="font-medium text-sm lg:text-base">Medical Records</p>
                          <p className="text-xs lg:text-sm text-purple-200">Access records</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg lg:text-xl font-semibold text-black">
                          Appointments for {selectedPerson.name}
                        </h3>
                        <p className="text-gray-700 text-sm lg:text-base">Manage and view all appointments</p>
                      </div>
                      <button
                        onClick={() => setShowAppointmentForm(true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-black text-sm lg:text-base"
                      >
                        New Appointment
                      </button>
                    </div>

                    <AppointmentList
                      employeeCode={employee.employeeCode}
                      selectedPerson={selectedPerson}
                      refreshTrigger={appointmentRefreshTrigger}
                    />

                  </div>
                )}

                {activeTab === "reports" && (
                  <div className="space-y-4 lg:space-y-6">
                    <div>
                      <h3 className="text-lg lg:text-xl font-semibold text-black">
                        Medical Records for {selectedPerson.name}
                      </h3>
                      <p className="text-gray-700 text-sm lg:text-base">View and manage medical records</p>
                    </div>
                    <div className="bg-[#fff] rounded-xl p-4 lg:p-6">
                      <div className="text-center py-8 lg:py-12">
                        <FileText className="h-12 w-12 lg:h-16 lg:w-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 text-base lg:text-lg">No medical records found</p>
                        <p className="text-gray-500 text-sm">Medical records will appear here once available</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-4 lg:space-y-6">
                    <div>
                      <h3 className="text-lg lg:text-xl font-semibold text-black">
                        Settings for {selectedPerson.name.toUpperCase()}
                      </h3>
                      <p className="text-gray-700 text-sm lg:text-base">Manage account and preferences</p>
                    </div>
                    <div className="bg-[#fff] rounded-xl p-4 lg:p-6">
                      <div className="text-center py-8 lg:py-12">
                        <Settings className="h-12 w-12 lg:h-16 lg:w-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 text-base lg:text-lg">Settings Panel</p>
                        <p className="text-gray-500 text-sm">Account settings and preferences will be available here</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Appointment Form Modal */}
      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        allPersons={allPersons}
        employeeCode={employee.employeeCode}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </div>
  )
}

export default Dashboard;
