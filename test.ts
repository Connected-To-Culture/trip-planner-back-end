import dotenv from 'dotenv';
dotenv.config();

// Then your existing imports and code
import { detectIntent } from './src/dialogflow';

console.log('Environment Variables:', {
  ProjectID: process.env.DIALOGFLOW_PROJECT_ID,
  LocationID: process.env.DIALOGFLOW_LOCATION_ID,
  AgentID: process.env.DIALOGFLOW_AGENT_ID
});

async function testDialogflowCX() {
    const text = "Hello, how are you?";
    const sessionId = "test-session";

    try {
        const response = await detectIntent(text, sessionId);
        console.log('Dialogflow CX Response:', response);
    } catch (error) {
        console.error('Error during Dialogflow CX request:', error);
    }
}

testDialogflowCX();
