const version = "0.3.0a";

const { WebSocketServer, WebSocket } = require('ws');

const express = require('express');
const http = require('http')
const app = express();
const server = http.createServer(app);
const port = 8080;

app.use('/client', express.static('public'));

const wss = new WebSocketServer({ server: server });

/** @type {Array<WebSocket>} */
let clients = [];

wss.on('connection', (ws) => {

    ws.on('close', () => {
        sendAll(`${ws.username} left the chat`);
        console.log(`${ws.username} left the chat`);
        clients.splice(clients.indexOf(ws), 1);
    });

    ws.on('message', (msg) => {
        /**
         * @typedef {Object} Message
         * @property {string} [username]
         * @property {string} data
         * @property {string} time
         * @property {string} [to]
         */

        /** @type {Message} */
        let message = JSON.parse(msg.toString());
        
        switch (message.type) {
            case "join":
                ws.username = message.data;
                console.log(`username ${ws.username} joined`);
                
                ws.send(JSON.stringify({
                    type: "info",
                    data: `Hello, and welcome to the chat! Your username is ${ws.username}. Server version: v${version}`,
                    time: new Date().toLocaleTimeString()
                }));
                ws.send(JSON.stringify({
                    type: "list",
                    data: clients,
                    time: new Date().toLocaleTimeString()
                }));

                sendAll(JSON.stringify({
                    type: "join",
                    data: `${ws.username}`,
                    time: new Date().toLocaleTimeString()
                }));
                
                clients.push(ws);

                break;

            case "rename":
                let username = message.data;

                console.log(username);

                let old = ws.username;
                ws.username = username;

                console.log(`renamed username ${old} to ${ws.username}`);
                sendAll(JSON.stringify({
                    type: "rename",
                    data: `${ws.username}`,
                    username: `${old}`,
                    time: new Date().toLocaleTimeString()
                }));

                break;

            case "message":
                if (message.to === undefined) {
                    wss.send(JSON.stringify({
                        type: "message",
                        username: username,
                        data: message,
                        time: new Date().toLocaleTimeString()
                    }));
                } else {
                    clients.forEach(client => {
                        if (client.username == message.to) {
                            client.send(JSON.stringify({
                                type: "message",
                                username: username,
                                data: message,
                                time: new Date().toLocaleTimeString()
                            }));
                            ws.send(JSON.stringify({
                                type: "info",
                                data: `DM to @${message.to} sent!`,
                                time: new Date().toLocaleTimeString()
                            }));
                        }
                    });
                }
                break;
            
            case "leave":
                let client = clients.find(client => client.username == message.username);
                
                sendAll(JSON.stringify({
                    type: "leave",
                    username: client.username,
                    time: new Date().toLocaleTimeString()
                }));

                console.log(`${client.username} left the chat`);
                clients.splice(clients.indexOf(client), 1);
                client.close();
                break;

            case "list":
                ws.send(JSON.stringify({
                    type: "list",
                    data: clients
                }));
                break;

            default:
                ws.send(`${command.slashcommand} command doesn't exist. Use /help to see available commands.`)
                break;
        }
    });
});

server.listen(port);

const sendAll = (message) => {
    clients.forEach(client => {
        client.send(message);
    });
}
