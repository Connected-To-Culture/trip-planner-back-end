import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import Survey from '~/models/surveyModel';

import { connectToMongoose } from '~/dBconfig/MongoDb';

connectToMongoose();

export default async (app: FastifyInstance) => {
    // POST request to create a new survey
    app.post('/survey', async (req: FastifyRequest, res: FastifyReply) => {
        try {
            // Assuming req.body contains the JSON object of the survey
            const surveyData = req.body;

            // Create a new instance of Survey model with surveyData
            const newSurvey = new Survey(surveyData);

            // Save the new survey to MongoDB
            const savedSurvey = await newSurvey.save();

            // Return the saved survey object with ID
            return res.send(savedSurvey);

        } catch (error) {
            console.error('Error saving survey:', error);
        }
    });

    // GET request to retrieve all surveys
    app.get('/survey', async (req: FastifyRequest, res: FastifyReply) => {
        try {
            // Fetch all surveys from MongoDB
            const surveys = await Survey.find();

            // Return the array of surveys
            return res.send(surveys);
        } catch (error) {
            console.error('Error fetching surveys:', error);
        }
    });

    // PUT request to update an existing survey
    app.put('/survey/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply) => {
        try {
            const surveyId = req.params.id;
            const surveyData = req.body;

            // Find the survey by ID and update it with new data
            const updatedSurvey = await Survey.findByIdAndUpdate(surveyId, surveyData, { new: true });

            if (!updatedSurvey) {
                return res.status(404).send({ error: 'Survey not found' });
            }

            // Return the updated survey object
            return res.send(updatedSurvey);
        } catch (error) {
            console.error('Error updating survey:', error);
        }
    });
};
