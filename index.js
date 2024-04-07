const slashCommand = (s) => {
    let cmds = s.split(' ')[0].match(/\/([\w-=:.@]+)/ig);
    let slashcmds;
    let body = s.trim();

    if (cmds) {
        slashcmds = cmds.join('');
        cmds = cmds.map(x => x.replace('/', ''));
        body = s.split(' ').filter((v, i) => i > 0).join(' ').trim() || null;
    }

    return {
        slashcommand: slashcmds,
        command: cmds ? cmds[0] : null,
        body: body,
        original: s
    };
};

const version = "0.2.1a";

String.prototype.legalName = function () {
    return !/\s/g.test(this.valueOf()) && !/\//g.test(this.valueOf());
}

const adjs = ["Fruity", "Blue", "Red", "Green", "Yellow", "Big", "Small", "Enormous", "Hungry", "Mini", "Round", "Squared", "Squishy"];
const nouns = ["Ball", "Car", "Phone", "Apple", "Phone", "Leaf", "Cat", "Frog", "Poet", "Actor", "Tea", "World", "Sauce", "House"];

function generateRandomWord() {
    let random = (adjs[Math.floor(Math.random() * adjs.length)] + nouns[Math.floor(Math.random() * nouns.length)]);

    let same = false;
    clients.forEach(client => {
        if (client.username == random) {
            same = true;
        }
    });

    return same ? generateRandomWord() : random;
}

const { WebSocketServer } = require('ws');

const express = require('express');
const http = require('http')
const app = express();
const server = http.createServer(app);
const port = 8000;

app.use('/client', express.static('public'));

const wss = new WebSocketServer({ server: server })

let clients = [];

wss.on('connection', (ws) => {
    ws.username = generateRandomWord();

    clients.push(ws);

    console.log(`username ${ws.username} joined`);

    ws.send(`Hello, and welcome to the chat! Your username is for now ${ws.username}. Server version: v${version}`);

    sendAll(`${ws.username} has joined the chat. Welcome ${ws.username}!`);

    ws.on('close', () => {
        sendAll(`${ws.username} left the chat`);
        console.log(`${ws.username} left the chat`);
        clients.splice(clients.indexOf(ws), 1);
    });

    ws.on('message', (msg) => {
        let message = msg.toString();

        if (message.trim().startsWith("/")) {
            let command = slashCommand(message.trim());

            switch (command.command) {

                case "help":
                    ws.send(`
                        <<<<<<<<<<<<<<<<<
                        Chatium by nikeedev - server version: v${version}.

                        Send a message by just writing it and pressing enter. 
                        
                        Commands: 
                        /help - shows this page again.

                        /name - rename yourself.

                        /msg [username] [message] - sends a direct message to the specified username

                        /list - show list of online users
                        --------------

                        More commands will be added later, you can watch the development on the GitHub repo of the chat:
                        https://github.com/nikeedev/chatium
                        >>>>>>>>>>>>>>>>>
                    `);
                    break;

                case "name":
                    let username = command.body.trim();

                    console.log(username);

                    if (!username.legalName()) {
                        ws.send(`Username cannot include spaces or "/" slash symbol due to parsing reasons.`);
                    }
                    else if (sameUsername(username)) {
                        ws.send(`Username is already in use. Please use another.`);
                    }
                    else {
                        let old = ws.username;
                        ws.username = username;

                        console.log(`renamed username ${old} to ${ws.username}`);

                        ws.send(`Renamed to ${ws.username}`);

                        sendAll(`${old} renamed themselves to ${ws.username}`);

                    }
                    break;

                case "msg":
                    let receiver = command.body.split(" ")[0];

                    let msg = command.body.split(" ").filter((v, i) => i > 0).join(' ');

                    clients.forEach(client => {
                        if (client.username == receiver) {
                            client.send(`From @${ws.username}: ${msg}`);
                            ws.send(`Direct message sent to @${client.username}`)
                        }
                    })
                    break;

                case "list":
                    ws.send(`\n`);
                    ws.send(` First to join ↓`);
                    clients.forEach((client, i) => ws.send(`${i + 1}: ${client.username}`))
                    ws.send(` Last to join ↑`)
                    ws.send(`\n`);
                    break;

                default:
                    ws.send(`${command.slashcommand} command doesn't exist. Use /help to see available commands.`)
                    break;
            }
        }
        else {
            console.log(`received: ${ws.username}: ${message}`);

            sendAll(`${ws.username}: ${message}`);
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
