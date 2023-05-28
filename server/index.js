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

    ws.on('message', (msg) => {
        if (typeof JSON.parse(msg.toString()) === "object")
        {
            console.log(msg.toString());

            ws.id = JSON.parse(msg.toString()).username;
            
            console.log(`username ${ws.id} joined`);

            ws.send(`Hello! Welcome ${ws.id} to the chat!`);

            sendAll(`${ws.id} has joined the chat`);

            clients.push(ws);
        
        }
        else {
            console.log("received: ", `${ws.id}: ${msg.toString()}`);
        
            sendAll(`${ws.id}: ${msg.toString()}`);
        }
    });

   
    

});

const sendAll = (message) => {
    clients.forEach(client => {
        client.send(message);
    });
}
