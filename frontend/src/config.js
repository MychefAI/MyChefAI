import { Platform } from 'react-native';

// TODO: Replace 'localhost' with your computer's local IP address (e.g., '192.168.0.x') 
// if running on a physical device.
// You can find your IP by running 'ipconfig getifaddr en0' (Mac) or 'ipconfig' (Windows) in terminal.
const LOCAL_IP = '172.30.1.47';

const API_BASE_URL = Platform.select({
    ios: `http://${LOCAL_IP}:8080/api`,
    android: `http://10.0.2.2:8080/api`, // Android Emulator default info
    web: `http://localhost:8080/api`,
    default: `http://${LOCAL_IP}:8080/api`,
});

export default {
    API_BASE_URL,
};
