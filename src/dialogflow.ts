// import { SessionsClient } from '@google-cloud/dialogflow-cx';
//
// const client = new SessionsClient();
//
// export async function detectIntent(text: string, sessionId: string) {
//     const projectId = 'xenon-heading-384913';  // Ensure these are correctly set
//     const locationId = 'global';
//     const agentId = 'ca7596ae-6bd1-4edf-bdf4-246087df2096';
//     const languageCode = 'en';  // Set the language code here
//
//     const sessionPath = client.projectLocationAgentSessionPath(
//         projectId, locationId, agentId, sessionId
//     );
//
//     const request = {
//         session: sessionPath,
//         queryInput: {
//             text: {
//                 text,
//                 languageCode,  // Make sure this is correctly placed inside the text object
//             },
//         },
//     };
//
//     try {
//         const [response] = await client.detectIntent(request);
//         return response.queryResult;
//     } catch (error) {
//         console.error('Error in detectIntent:', error);
//         throw error;
//     }
// }




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

