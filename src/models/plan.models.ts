import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  tripName: { type: String, required: true },
  tripStartDate: Date,
  tripEndDate: Date,
  numOfTravelers: Number,
  totalExpense: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export const Plan = mongoose.model('Plan', planSchema);
