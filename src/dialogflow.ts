
import { SessionsClient, protos } from '@google-cloud/dialogflow-cx';

type DetectIntentRequest = protos.google.cloud.dialogflow.cx.v3.IDetectIntentRequest;

async function detectIntent(text: string, sessionId: string, contextText: string = '') {
    const client = new SessionsClient();

    const projectId = process.env.DIALOGFLOW_PROJECT_ID;
    const locationId = process.env.DIALOGFLOW_LOCATION_ID;
    const agentId = process.env.DIALOGFLOW_AGENT_ID;

    if (!projectId || !locationId || !agentId) {
        throw new Error('Missing Dialogflow configuration. Check your .env file.');
    }

    const sessionPath = client.projectLocationAgentSessionPath(
        projectId,
        locationId,
        agentId,
        sessionId
    );

    const request: DetectIntentRequest = {
        session: sessionPath,
        queryInput: {
            text: {
                text: text
            },
            languageCode: 'en'
        },
        queryParams: {}
    };

    if (contextText) {
        request.queryParams = {
            parameters: {
                fields: {
                    additionalContext: {
                        stringValue: contextText
                    }
                }
            }
        };
    }

    console.log('Dialogflow request:', JSON.stringify(request, null, 2));

    try {
        const [response] = await client.detectIntent(request);
        console.log('Full Dialogflow response:', JSON.stringify(response, null, 2));
        return response.queryResult;
    } catch (error) {
        console.error('Error in detectIntent:', error);
        throw error;
    }
}

export { detectIntent };