require('dotenv').configDotenv();
const version = "0.3.0a";

const { WebSocketServer, WebSocket } = require('ws');

const express = require('express');
const http = require('http')
const app = express();
const server = http.createServer(app);
const port = 8080;

const authorized_bots = [
    {
        name: "Extermin",
        token: process.env.extermin_token
    },
    {
        name: "Scherzo",
        token: process.env.scherzo_token
    }
];

app.use('/', express.static('../client'));

const wss = new WebSocketServer({ server: server });

/** @type {Array<WebSocket>} */
let clients = [];

wss.on('connection', (ws) => {

    ws.on('close', () => {
        if (authorized_bots.map(bot => bot.name).includes(ws.username)) {
            sendAll(JSON.stringify({
                type: "bot.leave",
                username: ws.username,
                time: new Date().toLocaleTimeString()
            }));
            console.log(JSON.stringify({
                type: "bot.leave",
                username: ws.username,
                time: new Date().toLocaleTimeString()
            }));
        } else {
            console.log(`${ws.username} left the chat`);
            clients.splice(clients.indexOf(ws), 1);
            sendAll(JSON.stringify({
                type: "leave",
                username: ws.username,
                time: new Date().toLocaleTimeString()
            }));
        }
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
        // console.log(message);

        if (message.type.startsWith("bot.")) {
            message.type = message.type.replace("bot.", "");

            switch (message.type) {
                case "join":
                    let extermin_token = authorized_bots.find(bot => bot.name == "Extermin").token == message.data.token;
                    let scherzo_token = authorized_bots.find(bot => bot.name == "Scherzo").token == message.data.token;

                    // for mod bot:
                    if (extermin_token) {
                        ws.username = message.data.name;
                        ws.access = message.data.access;
                        console.log(`bot ${ws.username} joined`);

                        ws.send(JSON.stringify({
                            type: "info",
                            data: `bot successfully connected to server. Server version: v${version}`,
                            time: new Date().toLocaleTimeString()
                        }));

                        ws.send(JSON.stringify({
                            type: "list",
                            data: clients.map(client => client.username),
                            time: new Date().toLocaleTimeString()
                        }));

                        sendAll(JSON.stringify({
                            type: "bot.join",
                            data: `${ws.username}`,
                            time: new Date().toLocaleTimeString()
                        }));

                        clients.push(ws);
                    }
                    else if (scherzo_token) {
                        ws.username = message.data.name;
                        ws.access = message.data.access;
                        console.log(`bot ${ws.username} joined`);

                        ws.send(JSON.stringify({
                            type: "info",
                            data: `bot successfully connected to server. Server version: v${version}`,
                            time: new Date().toLocaleTimeString()
                        }));

                        ws.send(JSON.stringify({
                            type: "list",
                            data: clients.map(client => client.username),
                            time: new Date().toLocaleTimeString()
                        }));

                        sendAll(JSON.stringify({
                            type: "bot.join",
                            data: `${ws.username}`,
                            time: new Date().toLocaleTimeString()
                        }));

                        clients.push(ws);
                    }

                    break;

                case "action":
                    if (ws.access == "mod") {
                        let action = message.data;
                        switch (action.type) {
                            case "warning":
                                clients.forEach(client => {
                                    if (client.username == action.username) {
                                        client.send(JSON.stringify({
                                            username: message.username,
                                            type: "action",
                                            data: {
                                                type: "warning",
                                                reason: action.reason,
                                            },
                                            time: new Date().toLocaleTimeString()
                                        }));
                                    }
                                });
                                break;


                            case "kick":
                                clients.forEach(client => {
                                    if (client.username == action.username) {
                                        client.send(JSON.stringify({
                                            username: message.username,
                                            type: "action",
                                            data: {
                                                type: "kick",
                                                reason: action.reason,
                                            },
                                            time: new Date().toLocaleTimeString()
                                        }));
                                    }
                                });
                                sendAll(JSON.stringify({
                                    type: "info",
                                    data: `${action.username} has been kicked from the chat by @${message.username}`,
                                    time: new Date().toLocaleTimeString()
                                }));
                                break;
                        }
                    }
                    break;

                default:
                    break;
            }

        } else {
            switch (message.type) {
                case "join":
                    ws.username = message.data;
                    console.log(`user ${ws.username} joined`);

                    ws.send(JSON.stringify({
                        type: "info",
                        data: `Hello, and welcome to the chat! Your username is ${ws.username}. Server version: v${version}`,
                        time: new Date().toLocaleTimeString()
                    }));

                    ws.send(JSON.stringify({
                        type: "list",
                        data: clients.map(client => client.username),
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
                    console.log(message);
                    if (!message.hasOwnProperty("to")) {
                        sendAll(JSON.stringify({
                            type: "message",
                            username: message.username,
                            data: message.data,
                            time: new Date().toLocaleTimeString()
                        }));
                    } else {
                        clients.forEach(client => {
                            if (client.username == message.to) {
                                client.send(JSON.stringify({
                                    type: "message",
                                    username: message.username,
                                    to: message.to,
                                    data: message.data,
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

                    if (client !== undefined) {
                        console.log("leaving client", client.username == authorized_bots.map(bot => bot.name).includes(message.username))
                        if (client.username == authorized_bots.map(bot => bot.name).includes(message.username)) {
                            sendAll(JSON.stringify({
                                type: "bot.leave",
                                username: client.username,
                                time: new Date().toLocaleTimeString()
                            }));
                            console.log(JSON.stringify({
                                type: "bot.leave",
                                username: client.username,
                                time: new Date().toLocaleTimeString()
                            }));
                        } else {
                            sendAll(JSON.stringify({
                                type: "leave",
                                username: client.username,
                                time: new Date().toLocaleTimeString()
                            }));
                            console.log(JSON.stringify({
                                type: "leave",
                                username: client.username,
                                time: new Date().toLocaleTimeString()
                            }))

                            console.log(`${client.username} left the chat`);
                            clients.splice(clients.indexOf(client), 1);
                            client.close();
                        }
                    } else {
                        ws.send(JSON.stringify({
                            type: "info",
                            data: `don't even try to do that`,
                            time: new Date().toLocaleTimeString()
                        }));
                    }
                    break;

                case "list":
                    ws.send(JSON.stringify({
                        type: "list",
                        data: clients.map(client => client.username),
                    }));
                    break;

                default:
                    break;
            }
        }
    });

});


const sendAll = (message) => {
    clients.forEach(client => {
        client.send(message);
    });
}

server.listen(port);
console.log(`Server started on port ws://127.0.0.1:${port}`);
console.log(`Client started on port http://127.0.0.1:${port}`);


process.on('SIGINT', () => {
    console.log("\shutting down from SIGINT (Ctrl-C)");
    wss.close();
    server.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    ;
    wss.close();
    server.close();
    process.exit(0);
});