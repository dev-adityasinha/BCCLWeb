import mongoose from "mongoose"

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
      required: true,
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
    doctor: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "Rescheduled"],
      default: "Scheduled",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "appointments",
  },
)

appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

export const Appointment = mongoose.model("Appointment", appointmentSchema)
