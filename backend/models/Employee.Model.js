import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const employeeSchema = new mongoose.Schema({
  employeeCode: {
    type: String,
    required: true,
    unique: true,
  },
  employeeFirstName: {
    type: String,
    required: true,
  },
  employeeLastName: {
    type: String,
    required: true,
  },
  employeeGender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  employeePhoneNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  employeeDOB: {
    type: Date,
    required: true,
  },
  password:{
    type: String,
    required: true,
    minlength:8,
  },
  dependents: [
    {
      name: {
        type: String,
        required: true,
      },
      relation: {
        type: String,
        required: true,
      },
      gender: {
        type: String,
        required: true,
      },
      dob: {
        type: Date,
        required: true,
      },
    },
  ],
});

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
employeeSchema.methods.matchPassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};
export const Employee = mongoose.model("Employee", employeeSchema);
