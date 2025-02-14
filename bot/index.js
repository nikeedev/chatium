const { WebSocket } = require('ws');

const fs = require("fs");

let badWords = [
    "anal",
    "anus",
    "arse",
    "ass",
    "ballsack",
    "bastard",
    "bitch",
    "biatch",
    "blowjob",
    "blow job",
    "bollock",
    "bollok",
    "boner",
    "boob",
    "bugger",
    "bum",
    "buttplug",
    "clitoris",
    "cock",
    "coon",
    "cunt",
    "dick",
    "dildo",
    "dyke",
    "fag",
    "feck",
    "fellate",
    "fellatio",
    "felching",
    "fuck",
    "f u c k",
    "fudgepacker",
    "fudge packer",
    "flange",
    "homo",
    "jerk",
    "jizz",
    "knobend",
    "knob end",
    "labia",
    "muff",
    "nigger",
    "nigga",
    "penis",
    "piss",
    "poop",
    "prick",
    "pube",
    "pussy",
    "queer",
    "scrotum",
    "sex",
    "slut",
    "smegma",
    "spunk",
    "tit",
    "tosser",
    "turd",
    "twat",
    "wank",
    "whore",
];
// Enter chatium server address here (e.g. 'ws://localhost:8080' , port 8080 is default server port for a chatium server) 
const wss = new WebSocket('ws://localhost:8080');

// Extermin bot info
const extermin = {
    token: "Y2lLMHk2M3V2dkxPMzhWQ3dPeWVrOHV6djRyQnBTcmhBV2FxQURoUTI=",
    name: "Extermin",
    access: ["mod"]
};

let once = false;
var clients = [];

const run = async () => {
    wss.onmessage = (ws) => {
        console.log("ws data: "+ws.data);
        // console.log(clients);

        /** @type {Message} */
        let message = JSON.parse(ws.data.toString());
        // console.log(message);

        switch (message.type) {
            case "join":
                clients.push({ name: message.data, warnings: 0 });
                console.log(`${message.time}\t@${message.data} joined the server! Welcome @${message.data}!`, false);

                break;

            case "rename":
                clients[clients.map(client => client.name).indexOf(message.username)].name = message.data;
                console.log(clients.indexOf(message.username));
                console.info(`${message.time}\t@${message.username} changed their username to ${message.data}.`, false);

                break;

            case "message":
                // console.log(clients.map(client => client.name))
                // console.log(clients[clients.map(client => client.name).indexOf(message.username)]);
                /** @type {String} */
                badWords.forEach(word => {
                    if (message.data.includes(word)) {
                        if (clients[clients.map(client => client.name).indexOf(message.username)].warnings <= 2) { 
                            wss.send(JSON.stringify({
                                username: extermin.name,
                                type: "bot.action",
                                data: {
                                    type: "warning",
                                    username: message.username,
                                    reason: "Excessive use of bad language in chat, you have " + (3 - clients[clients.map(client => client.name).indexOf(message.username)].warnings) + " warnings left before you get kicked"
                                },
                                time: new Date().toLocaleTimeString()
                            }));
                            clients[clients.map(client => client.name).indexOf(message.username)].warnings++;
                        } else {
                            wss.send(JSON.stringify({
                                username: extermin.name,
                                type: "bot.action",
                                data: {
                                    type: "kick",
                                    username: message.username,
                                    reason: "Excessive use of bad language in chat"
                                },
                                time: new Date().toLocaleTimeString()
                            }));
                        }
                    }

                });

                break;

            case "leave":
                console.info(`${message.time}\t${message.username} left the chat`);
                // console.log(`${ws.username} left the chat`);
                clients.splice(clients.indexOf(message.username), 1);
                break;

            case "list":
                // console.log(message.data);
                message.data.forEach(client => {
                    if (!clients.includes(client)) {
                        clients.push({name:client, warnings: 0});
                    }
                });
                console.log(clients);
                break;

            case "info":
                console.info(`${message.time}\tFrom server: ${message.data}`);
                break;
        }
    };

    wss.onopen = (ws) => {
        if (!once) {
            once = true;
            wss.send(JSON.stringify(
                {
                    type: "bot.join",
                    data: {
                        name: extermin.name,
                        token: extermin.token,
                        access: extermin.access
                    },
                }
            ));
        }
    };

    wss.onclose = (ws) => {
        if (wss.readyState != 1 || wss.readyState != 0) {
            let closing_message = "Chat's server is either down or something is wrong with your network connection. Restart the bot, or try again later.";
            // console.log(closing_message);
            // console.log(ws);
            console.error(closing_message);
        }
    };

    wss.onerror = (e) => {
        console.error("Error: ", e);
    };
}

run();