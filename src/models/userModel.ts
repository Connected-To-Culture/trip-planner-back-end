import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Please Provide a first name'],
    },
    lastname: {
        type: String,
        required: [true, 'Please Provide a LastName'],
    },
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
    },
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
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
    survey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
    },
});

const User = mongoose.models.users || mongoose.model('users', userSchema);
export default User;
