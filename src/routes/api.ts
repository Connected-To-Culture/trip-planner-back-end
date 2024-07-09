import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { detectIntent } from '../dialogflow';
import { connectToDatabase, collections } from '../utils/chatbot-database';
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { GoogleVertexAIEmbeddings } from "@langchain/community/embeddings/googlevertexai";

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

interface DialogflowWebhookRequest {
  queryResult: {
    queryText: string;
    parameters: {
      additionalContext?: string;
    };
    intent?: {
      displayName: string;
    };
  };
}

let vectorSearch: MongoDBAtlasVectorSearch;

export default async function setupRoutes(fastify: FastifyInstance) {
    console.log('Initializing API routes...');
    try {
        await connectToDatabase();
        console.log('Database connected successfully');

        const embeddings = new GoogleVertexAIEmbeddings();
        vectorSearch = new MongoDBAtlasVectorSearch(embeddings, {
            collection: collections.context as any,
            indexName: 'vector_index',
            textKey: 'text',
            embeddingKey: 'embedding',
        });
        console.log('Vector search initialized');

        console.log('Registering chat route');
        fastify.post<{ Body: ChatRequest }>('/api/chat', async (request, reply) => {
            console.log('Received chat request:', request.body);
            const { text, sessionId } = request.body;
            try {
                let contextText = '';

                if (!text.toLowerCase().includes('hello') && !text.toLowerCase().includes('hi')) {
                    console.log('Performing vector search...');
                    const contextData = await vectorSearch.similaritySearch(text, 5);
                    contextText = contextData.map(doc => doc.pageContent).join(' ').slice(0, 2000);
                    console.log('Vector search context:', contextText);
                } else {
                    console.log('Skipping vector search for greeting');
                }

                console.log('Detecting intent with Dialogflow...');
                const dfResponse = await detectIntent(text, sessionId, contextText) as DialogflowResponse;
                console.log('Dialogflow response:', JSON.stringify(dfResponse, null, 2));

                if (dfResponse.responseMessages && dfResponse.responseMessages.length > 0) {
                    const fullReply = dfResponse.responseMessages
                        .filter(message => message.text && message.text.text)
                        .map(message => message.text!.text.join(' '))
                        .join(' ');

                    if (fullReply) {
                        console.log('Sending reply:', fullReply);
                        reply.send({ reply: fullReply });
                    } else {
                        console.log('No valid response text found');
                        reply.status(404).send({ error: 'No valid response text found.' });
                    }
                } else {
                    console.log('No response messages found');
                    reply.status(404).send({ error: 'No response messages found.' });
                }
            } catch (error) {
                console.error('Error during chat processing:', error);
                reply.status(500).send({ error: 'Chat processing failed.', details: error.message });
            }
        });

        console.log('Registering dialogflow-webhook route');
        fastify.post('/dialogflow-webhook', async (request, reply) => {
            try {
                console.log('Received webhook request:', request.body);
                const body = request.body as DialogflowWebhookRequest;
                const intentDisplayName = body.queryResult.intent?.displayName || 'unknown';
                const queryText = body.queryResult.queryText;

                let response: string;

                switch (intentDisplayName) {
                    case 'ask about stocks':
                        response = "A stock represents partial ownership in a company. When you buy a stock, you own a small part of that company's assets and earnings.";
                        break;
                    case 'ask about investing':
                        response = "Investing is the act of allocating resources, usually money, with the expectation of generating an income or profit. It's a way to grow your wealth over time.";
                        break;
                    default:
                        response = `I'm not sure about "${queryText}". Could you please ask about stocks or investing?`;
                }

                console.log('Sending webhook response:', response);
                reply.send({
                    fulfillmentText: response
                });
            } catch (error) {
                console.error('Error in webhook:', error);
                reply.status(500).send({ error: 'Internal server error' });
            }
        });

        console.log('API routes initialized successfully');
    } catch (error) {
        console.error('Error during API setup:', error);
        throw error;
    }
}