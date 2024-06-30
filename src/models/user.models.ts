import mongoose from 'mongoose';
import { Provider } from '~/types/enums.types';

const userSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: Object.values(Provider),
    required: true,
  },
  providerId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
  },
  profileImage: {
    type: String,
  },
});

export const User = mongoose.model('users', userSchema);
