import mongoose from 'mongoose';

// Schema definition
const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  travellerCount: {
    type: Number,
  },
  totalCost: {
    type: Number,
    default: 0,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export const Plan = mongoose.model('Plan', planSchema);
