import mongoose from 'mongoose';
import { logger } from '~/utils/logger.utils';
export async function connectToMongoose() {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    const { connection } = mongoose;
    connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });
    connection.on('error', (err) => {
      logger.error(
        `MongoDB connection error. Please make sure MongoDB is running.: ${err}`,
      );
      process.exit();
    });
  } catch (err) {
    logger.error(`MongoDB connection error: ${err}`);
  }
}
