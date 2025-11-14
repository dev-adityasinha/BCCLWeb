import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { Appointment } from "./models/Appointment.model.js";
import { Doctor } from "./models/Doctor.Model.js";
import { Employee } from "./models/Employee.Model.js";
import { seedDoctors } from "./seed/doctors.seed.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.options("*", cors());


const PORT = process.env.PORT || 9000;

// ----------------------
// Mongo Connection
// ----------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ MongoDB connected");
    try {
      await seedDoctors();
    } catch (err) {
      console.warn("Non-fatal seed error:", err.message);
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Health Check
app.get("/health-check", (req, res) => res.send("Server is healthy ✅"));

// ----------------------
// Employee Register
// ----------------------
app.post("/register", async (req, res) => {
  try {
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
    if (existing)
      return res.status(409).json({ error: "Employee already exists" });

    const hashed = await bcrypt.hash(employeePassword, 10);

    const newEmployee = new Employee({
      employeeFirstName,
      employeeLastName,
      employeeGender,
      employeeCode,
      employeePhoneNumber,
      employeeDOB,
      password: hashed,
      dependents,
    });

    await newEmployee.save();

    const employeeResponse = { ...newEmployee.toObject() };
    delete employeeResponse.password;

    res.status(201).json({ message: "Employee registered", employee: employeeResponse });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------
// Employee Login
// ----------------------
app.post("/login", async (req, res) => {
  try {
    let { employeeCode, password } = req.body;

    // Convert incoming employeeCode (string) → number
    employeeCode = Number(employeeCode);

    if (!employeeCode || !password) {
      return res.status(400).json({ success: false, message: "Employee code and password are required" });
    }

    const employee = await Employee.findOne({ employeeCode });
    if (!employee)
      return res.status(401).json({ success: false, message: "Invalid employee code or password" });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid employee code or password" });

    const employeeResponse = {
      employeeCode: employee.employeeCode,
      employeeFirstName: employee.employeeFirstName,
      employeeLastName: employee.employeeLastName,
      employeeGender: employee.employeeGender,
      employeePhoneNumber: employee.employeePhoneNumber,
      employeeDOB: employee.employeeDOB,
      dependents: employee.dependents,
    };

    res.status(200).json({ success: true, message: "Login successful", employee: employeeResponse });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Doctor Login
// ----------------------
app.post("/doctor-login", async (req, res) => {
  try {
    const { doctorCode, password } = req.body;

    if (!doctorCode || !password)
      return res.status(400).json({ success: false, message: "Doctor code and password are required" });

    if (password !== process.env.DOCTOR_PASSWORD)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const doctor = await Doctor.findOne({ doctorCode });
    if (!doctor)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    res.status(200).json({ success: true, message: "Doctor login successful", doctor });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Get All Doctors
// ----------------------
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error("Fetch doctors error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Create Appointment
// ----------------------
app.post("/api/appointments/create", async (req, res) => {
  try {
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

    if (!employeeCode || !patientName || !appointmentDate || !appointmentTime || !doctorCode) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const dayStart = new Date(appointmentDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayStart.getUTCDate() + 1);

    const lastAppointment = await Appointment.findOne({
      doctorCode,
      appointmentDate: { $gte: dayStart, $lt: dayEnd },
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

    res.status(201).json({ success: true, message: "Appointment created", appointment: newAppointment });
  } catch (error) {
    console.error("Appointment save error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Get Employee Appointments
// ----------------------
app.get("/api/appointments", async (req, res) => {
  try {
    const { employeeCode, patientName } = req.query;

    if (!employeeCode || !patientName)
      return res.status(400).json({ success: false, message: "Missing employeeCode or patientName" });

    const appointments = await Appointment.find({
      employeeCode: String(employeeCode).trim(),
      patientName: new RegExp(`^${patientName.trim()}$`, "i"),
    }).sort({ appointmentDate: 1, appointmentTime: 1, tokenNumber: 1 });

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Fetch appointments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Get Doctor Appointments
// ----------------------
app.get("/api/doctor/appointments/:doctorCode", async (req, res) => {
  try {
    const { doctorCode } = req.params;

    const appointments = await Appointment.find({
      doctorCode: String(doctorCode).trim(),
    }).sort({ appointmentDate: 1, appointmentTime: 1, tokenNumber: 1 });

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Fetch doctor appts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Update Appointment
// ----------------------
app.patch("/api/appointments/:id/update", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, medicalReport } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (medicalReport !== undefined) updateFields.medicalReport = medicalReport;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!appointment)
      return res.status(404).json({ success: false, message: "Appointment not found" });

    res.json({ success: true, appointment });
  } catch (error) {
    console.error("Update appt error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------
// Delete Appointment
// ----------------------
app.delete("/api/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res.status(404).json({ success: false, message: "Appointment not found" });

    if (appointment.status !== "Cancelled") {
      return res.status(403).json({ success: false, message: "Only cancelled appointments can be deleted" });
    }

    await Appointment.findByIdAndDelete(id);

    res.json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    console.error("Delete appt error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ----------------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
