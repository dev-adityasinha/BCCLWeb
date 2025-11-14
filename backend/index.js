import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { configDotenv } from "dotenv";
import bcrypt from "bcryptjs";

import { Appointment } from "./models/Appointment.model.js";
import { Doctor } from "./models/Doctor.Model.js";
import { Employee } from "./models/Employee.Model.js";
import { seedDoctors } from "./seed/doctors.seed.js";

configDotenv();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 9000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedDoctors();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/health-check", (req, res) => {
  res.send("Server is healthy ✅");
});

// Employee Register
app.post("/register", async (req, res) => {
  const {
    employeeFirstName,
    employeeLastName,
    employeeGender,
    employeeCode,
    employeePhoneNumber,
    employeeDOB,
    employeePassword,
    dependents = [],
  } = req.body;

  if (
    !employeeFirstName ||
    !employeeLastName ||
    !employeeGender ||
    !employeeCode ||
    !employeePhoneNumber ||
    !employeePassword ||
    !employeeDOB
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existing = await Employee.findOne({
    $or: [{ employeeCode }, { employeePhoneNumber }],
  });
  if (existing) return res.status(409).json({ error: "Employee already exists" });

  try {
    const newEmployee = new Employee({
      employeeFirstName,
      employeeLastName,
      employeeGender,
      employeeCode,
      employeePhoneNumber,
      employeeDOB,
      password: employeePassword,
      dependents,
    });
    await newEmployee.save();
    res.status(201).json({ message: "Employee registered", employee: newEmployee });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Employee Login
app.post("/login", async (req, res) => {
  const { employeeCode, password } = req.body;

  if (!employeeCode || !password) {
    return res.status(400).json({ success: false, message: "Employee code and password are required." });
  }

  try {
    const employee = await Employee.findOne({ employeeCode });

    if (!employee) {
      return res.status(401).json({ success: false, message: "Invalid employee code or password." });
    }

    const isMatch = await employee.matchPassword(password);

    if (isMatch) {
      const employeeResponse = {
        employeeCode: employee.employeeCode,
        employeeFirstName: employee.employeeFirstName,
        employeeLastName: employee.employeeLastName,
        employeeGender: employee.employeeGender,
        employeePhoneNumber: employee.employeePhoneNumber,
        employeeDOB: employee.employeeDOB,
        dependents: employee.dependents,
      };
      return res.status(200).json({ success: true, message: "Login successful", employee: employeeResponse });
    } else {
      return res.status(401).json({ success: false, message: "Invalid employee code or password." });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// Doctor login
app.post("/doctor-login", async (req, res) => {
  const { doctorCode, password } = req.body;

  if (!doctorCode || !password) {
    return res.status(400).json({ success: false, message: "Doctor code and password are required." });
  }

  if (password !== process.env.DOCTOR_PASSWORD) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }

  try {
    const doctor = await Doctor.findOne({ doctorCode });

    if (!doctor) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    res.status(200).json({
      success: true,
      message: "Doctor login successful",
      doctor: doctor,
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({ success: false, message: "Server error during doctor login." });
  }
});

// Get All Doctors
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ success: false, message: "Server error fetching doctors." });
  }
});

// Appointment Create
app.post("/api/appointments/create", async (req, res) => {
  const {
    employeeCode,
    patientName,
    patientAge,
    patientGender,
    patientRelation,
    patientPhone,
    patientAddress,
    appointmentDate,
    appointmentTime,
    doctorCode,
    notes,
  } = req.body;

  if (
    !employeeCode ||
    !patientName ||
    !appointmentDate ||
    !appointmentTime ||
    !doctorCode
  ) {
    return res.status(400).json({ success: false, message: "Missing required fields for appointment." });
  }

  try {
    const today = new Date(appointmentDate);
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    const lastAppointment = await Appointment.findOne({
      doctorCode,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow,
      },
    })
      .sort({ tokenNumber: -1 })
      .limit(1);

    const newTokenNumber = lastAppointment ? lastAppointment.tokenNumber + 1 : 1;

    const newAppointment = new Appointment({
      employeeCode,
      patientName,
      patientAge,
      patientGender,
      patientRelation,
      patientAddress,
      appointmentDate,
      appointmentTime,
      doctorCode,
      notes,
      patientPhone,
      tokenNumber: newTokenNumber,
    });

    await newAppointment.save();
    res.status(201).json({ success: true, message: "Appointment Created and Saved", appointment: newAppointment });
  } catch (error) {
    console.error("Error saving appointment:", error);
    res.status(500).json({ success: false, message: "Server Error saving appointment" });
  }
});

// Fetching Appointment (for Employee Dashboard)
app.get("/api/appointments", async (req, res) => {
  const { employeeCode, patientName } = req.query;

  if (!employeeCode || !patientName) {
    return res.status(400).json({ success: false, message: "Missing employeeCode or patientName" });
  }

  try {
    const appointments = await Appointment.find({
      employeeCode: String(employeeCode).trim(),
      patientName: new RegExp(`^${patientName.trim()}$`, 'i')
    }).sort({ appointmentDate: 1, appointmentTime: 1, tokenNumber: 1 });

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching employee appointments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetching Appointments for a specific Doctor
app.get("/api/doctor/appointments/:doctorCode", async (req, res) => {
  const { doctorCode } = req.params;

  if (!doctorCode) {
    return res.status(400).json({ success: false, message: "Doctor code is required." });
  }

  try {
    const appointments = await Appointment.find({ doctorCode: String(doctorCode).trim() })
      .sort({ appointmentDate: 1, appointmentTime: 1, tokenNumber: 1 });

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching doctor's appointments:", error);
    res.status(500).json({ success: false, message: "Server error fetching doctor's appointments." });
  }
});

// Update Appointment Status and/or Medical Report
app.patch("/api/appointments/:id/update", async (req, res) => {
  const { id } = req.params;
  const { status, medicalReport } = req.body; // Expect medicalReport

  if (!status && medicalReport === undefined) {
    return res.status(400).json({ success: false, message: "No update data provided (status or medical report)." });
  }

  try {
    const updateFields = {};
    if (status) updateFields.status = status;
    if (medicalReport !== undefined) updateFields.medicalReport = medicalReport;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    res.json({ success: true, message: "Appointment updated successfully.", appointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ success: false, message: "Server error updating appointment." });
  }
});

// Delete appointment (only if cancelled)
app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "Cancelled") {
      return res.status(403).json({
        success: false,
        message: "Only cancelled appointments can be deleted.",
      });
    }

    await Appointment.findByIdAndDelete(id);

    res.json({ success: true, message: "Cancelled appointment deleted successfully." });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));