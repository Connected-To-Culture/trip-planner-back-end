import dialogflow from '@google-cloud/dialogflow-cx';

async function detectIntent(text: string, sessionId: string) {
    const client = new dialogflow.SessionsClient();

    const sessionPath = client.projectLocationAgentSessionPath(
        'xenon-heading-384913',  // Project ID
        'global',                // Location ID
        'ca7596ae-6bd1-4edf-bdf4-246087df2096',  // Agent ID
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



