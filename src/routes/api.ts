import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { detectIntent } from '../dialogflow';

interface ChatRequest {
    text: string;
    sessionId: string;
}

interface DialogflowResponse {
    responseMessages?: Array<{
        text?: { text: string[] };
        messageType?: string;
    }>;
}

export default async function apiRoutes(fastify: FastifyInstance) {
    fastify.post< { Body: ChatRequest }>('/chat', async (request, reply) => {
        console.log('Received chat request:', request.body);
        const { text, sessionId } = request.body;

        try {
            const dfResponse = await detectIntent(text, sessionId) as DialogflowResponse;
            console.log('Dialogflow response:', dfResponse);

            if (dfResponse.responseMessages && dfResponse.responseMessages.length > 0) {
                const firstResponse = dfResponse.responseMessages[0];
                if (firstResponse.text && firstResponse.text.text) {
                    reply.send({ reply: firstResponse.text.text.join(' ') });
                } else {
                    reply.status(404).send({ error: 'No valid response text found.' });
                }
            } else {
                reply.status(404).send({ error: 'No response messages found.' });
            }
        } catch (error) {
            console.error('Error during Dialogflow request:', error);
            reply.status(500).send({ error: 'Dialogflow request failed.' });
        }
    });

    fastify.get('/chat', async (request, reply) => {
        reply.send({ message: 'Chat service is operational.' });
    });
}
