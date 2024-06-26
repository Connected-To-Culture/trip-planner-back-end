import mongoose from 'mongoose';
export async function connectToMongoose() {
    try {
        mongoose.connect(process.env.MONGODB_URL);
        const { connection } = mongoose;
        connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });
        connection.on('error', err => {
            console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
            process.exit();
        });
    } catch (error) {
       
        console.log('goes wrong ' + error); 
    }

}