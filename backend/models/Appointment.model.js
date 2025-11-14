import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      ref: "Employee",
    },
    patientName: {
      type: String,
      required: true,
    },
    patientAge: {
      type: Number,
      default: 0,
    },
    patientGender: {
      type: String,
      required: true,
    },
    patientRelation: {
      type: String,
      required: true,
    },
    patientPhone: {
      type: String,
      required: true,
    },
    patientAddress: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    doctorCode: {
      type: String,
      required: true,
      ref: "Doctor",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Upcoming", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    medicalReport: { // Renamed to clearly indicate medical report
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "appointments",
  }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);