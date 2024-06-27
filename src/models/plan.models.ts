import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
    tripName: String,
    tripStartDate: Date,
    tripEndDate: Date,
    numOfTravelers: Number,
    totalExpense: Number,
});

const Plan = mongoose.model('Plan', planSchema);

export { Plan };
