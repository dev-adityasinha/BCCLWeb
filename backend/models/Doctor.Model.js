import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  doctorCode: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  availableDays: {
    type: [String],
    required: true,
  },
  timings: {
    type: String,
    required: true,
  },
});

export const Doctor = mongoose.model("Doctor", doctorSchema);