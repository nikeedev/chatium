const version = "0.3.0a";

const { WebSocketServer } = require('ws');

const express = require('express');
const http = require('http')
const app = express();
const server = http.createServer(app);
const port = 8000;

app.use('/client', express.static('public'));

const wss = new WebSocketServer({ server: server })

/** @type {Array<WebSocket>} */
let clients = [];

wss.on('connection', (ws) => {

    ws.on('close', () => {
        sendAll(`${ws.username} left the chat`);
        console.log(`${ws.username} left the chat`);
        clients.splice(clients.indexOf(ws), 1);
    });

    ws.on('message', (msg) => {
        let message = JSON.parse(msg.toString());
        
        switch (message.type) {

            case "join":
                ws.username = message.data;
                console.log(`username ${ws.username} joined`);
                
                ws.send(`Hello, and welcome to the chat! Your username is for now ${ws.username}. Server version: v${version}`);
                sendAll(`${ws.username} has joined the chat. Welcome ${ws.username}!`);
                
                clients.push(ws);

                break;

            case "rename":
                let username = message.data;

                console.log(username);

                let old = ws.username;
                ws.username = username;

                console.log(`renamed username ${old} to ${ws.username}`);
                ws.send(`Renamed to ${ws.username}`);
                sendAll(`${old} renamed themselves to ${ws.username}`);

                break;

            case "message":
                if (message.to === undefined) {
                    sendAll(`@${ws.username}: ${message.data}`);
                } else {
                    clients.forEach(client => {
                        if (client.username == message.to) {
                            client.send(`From @${ws.username}: ${message.data}`);
                            ws.send(`Message sent to @${client.username}!`)
                        }
                    });
                }
                break;
            
            case "leave":
                sendAll(`${ws.username} left the chat`);
                console.log(`${ws.username} left the chat`);
                clients.splice(clients.indexOf(ws), 1);
                ws.close();
                break;

            default:
                ws.send(`${command.slashcommand} command doesn't exist. Use /help to see available commands.`)
                break;
        }
    });
});

server.listen(port)

const sameUsername = (username) => {
    let same = false;
    clients.forEach(client => {
        if (client.username == username) {
            same = true;
        }
    });
    return same;
}

const sendAll = (message) => {
    clients.forEach(client => {
        client.send(message);
    });
}
