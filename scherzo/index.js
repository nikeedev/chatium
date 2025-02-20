const { WebSocket } = require('ws');
require('dotenv').configDotenv();

// Enter chatium server address here (e.g. 'ws://localhost:8080' , port 8080 is default server port for a chatium server) 
const wss = new WebSocket('ws://localhost:8080');

// scherzo bot info
const scherzo = {
    token: process.env.token,
    name: "Scherzo",
    access: []
};

let once = false;
var clients = [];

const run = async () => {
    wss.onmessage = (ws) => {
        console.log("ws data: " + ws.data);
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
                console.log(`${message.time}\t${message.username}: ${message.data}`);
                if (message.data.startsWith(".")) {
                    message.data = message.data.slice(1);
                    let command = message.data.split(" ")[0];
                    let args = message.data.split(" ").slice(1);
                    console.log(command);
                    console.log(args);
                }
                
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
                        name: scherzo.name,
                        token: scherzo.token,
                        access: scherzo.access
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
        if (!(wss.readyState != 1 || wss.readyState != 0)) {
            console.error("Error: ", e);
        }
    };
}

run();