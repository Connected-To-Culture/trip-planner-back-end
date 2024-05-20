import mongoose from "mongoose";

// we need to set values as required if needed
 
const planSchema = new mongoose.Schema({
  tripName: String,
  tripStartDate: Date,
  tripEndDate: Date,
  numOfTravelers: Number,
  totalExpense: Number,
});

const Plan = mongoose.model("Plan", planSchema);

export { Plan };
