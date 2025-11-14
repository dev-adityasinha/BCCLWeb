import { Doctor } from "../models/Doctor.Model.js";

export const seedDoctors = async () => {
  try {
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      console.log("Seeding doctors...");
      const seededDocs = await Doctor.create([
        // Store the created documents
        {
          doctorCode: "DOC001",
          name: "Dr. Aditya Sinha",
          department: "General Medicine",
          availableDays: ["Monday", "Wednesday", "Friday"],
          timings: "09:00 AM - 01:00 PM",
        },
        {
          doctorCode: "DOC002",
          name: "Dr. Zaid Alam",
          department: "Pediatrics",
          availableDays: ["Tuesday", "Thursday"],
          timings: "12:00 PM - 06:00 PM",
        },
        {
          doctorCode: "DOC003",
          name: "Dr. Lucky Singh",
          department: "Orthopedics",
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          timings: "02:00 PM - 08:00 PM",
        },
        {
          doctorCode: "DOC004",
          name: "Dr. Anil Kumar Sinha",
          department: "Cardialogist",
          availableDays: ["Thursday", "Friday"],
          timings: "02:00 PM - 08:00 PM"
        }
      ]);
      console.log("Doctors seeded successfully!");

      console.log("Seeded doctors:", seededDocs.map(doc => doc.name).join(', '));
    } else {
      console.log("Doctors already exist, skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding doctors:", error);
  }
};