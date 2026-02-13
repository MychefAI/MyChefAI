import { Platform } from 'react-native';
import { LOCAL_IP } from './secrets';

// TODO: Replace 'localhost' with your computer's local IP address (e.g., '192.168.0.x') 
// if running on a physical device.
// You can find your IP by running 'ipconfig getifaddr en0' (Mac) or 'ipconfig' (Windows) in terminal.
// const LOCAL_IP = '172.30.1.47'; // Moved to secrets.js

const API_BASE_URL = Platform.select({
    ios: `http://${LOCAL_IP}:8080/api`,
    android: `http://${LOCAL_IP}:8080/api`, // Use LOCAL_IP for physical devices
    web: `http://localhost:8080/api`,
    default: `http://${LOCAL_IP}:8080/api`,
});

export default {
    API_BASE_URL,
};
