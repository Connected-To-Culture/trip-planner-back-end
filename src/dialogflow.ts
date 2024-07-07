import dialogflow from '@google-cloud/dialogflow-cx';

async function detectIntent(text: string, sessionId: string) {
    const client = new dialogflow.SessionsClient();

    const sessionPath = client.projectLocationAgentSessionPath(
        process.env.DIALOGFLOW_PROJECT_ID,  // Project ID from .env
        process.env.DIALOGFLOW_LOCATION_ID, // Location ID from .env
        process.env.DIALOGFLOW_AGENT_ID,    // Agent ID from .env
        sessionId
    );

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: text,
            },
            languageCode: 'en',
        },
    };

    try {
        const [response] = await client.detectIntent(request);
        return response.queryResult;
    } catch (error) {
        console.error('Error in detectIntent:', error);
        throw error;
    }
}

export { detectIntent };



