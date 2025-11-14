import mongoose from "mongoose"


const dependentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    relation: String,
    gender: String,
    employee: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }]
});

export default mongoose.models.Dependent || mongoose.model("Dependent", dependentSchema);