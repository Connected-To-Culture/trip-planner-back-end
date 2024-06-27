import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide a email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  isVerfied: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.models.users || mongoose.model('users', userSchema);
export default User;
