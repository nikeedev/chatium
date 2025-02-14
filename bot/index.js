const { WebSocket } = require('ws');

// Enter chatium server address here (e.g. 'ws://localhost:8080' , port 8080 is default server port for a chatium server) 
const ws = new WebSocket('ws://localhost:8080');

// Extermin bot info
const extermin = {
    token: "9h24rhcdu32h98cu29ri0824hruywef",
    name: "Extermin",
    access: ["kick", "ban"] 
};
