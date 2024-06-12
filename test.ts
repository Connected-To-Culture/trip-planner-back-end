import { detectIntent } from './src/dialogflow';

async function testDialogflowCX() {
    const text = "Hello, how are you?";  // Example input
    const sessionId = "test-session";  // A fixed session ID for testing

    try {
        const response = await detectIntent(text, sessionId);
        console.log('Dialogflow CX Response:', response);
    } catch (error) {
        console.error('Error during Dialogflow CX request:', error);

    }
}

testDialogflowCX();
