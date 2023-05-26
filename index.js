const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({port: 8800})

let clients = [];

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

wss.on('connection', (ws) => {
    ws.id = wss.getUniqueID();

    clients.push(ws);

    ws.send(`Hello! Your, username is ${ws.id}`);

    ws.on('message', (msg) => {
        console.log("received: ", `${ws.id}: ${msg.toString()}`);
        
        sendAll(`${ws.id}: ${msg.toString()}`);
    });

});

const sendAll = (message) => {
    clients.forEach(client => {
        client.send(message);
    });
}
