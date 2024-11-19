/** @type {HTMLInputElement} */
const input = document.getElementById("input");

/** @type {HTMLDivElement} */
const output = document.getElementById("output");

output.style.width = `${window.innerWidth - 40}px`;
output.style.height = `${window.innerHeight - 60}px`;
input.style.width = `${window.innerWidth - 60}px`;

Element.prototype.message = function (message) {
    this.innerText += `${message}\n`;
}

Element.prototype.info = function (message) {
    let p = document.createElement("p");
    p.style.color = "blue";
    p.innerText = message;
    this.insertBefore(p, this.firstChild);
    this.insertBefore(document.createElement("br"), this.firstChild);
}

Element.prototype.error = function (message) {
    let p = document.createElement("p");
    p.style.color = "red";
    p.innerText = message;
    this.insertBefore(p, this.firstChild);
    this.insertBefore(document.createElement("br"), this.firstChild);
}

/// https://github.com/krismuniz/slash-command
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
///


String.prototype.legalName = function () {
    return !/\s/g.test(this.valueOf()) && !/\//g.test(this.valueOf());
}

const adjs = ["Fruity", "Blue", "Red", "Green", "Yellow", "Big", "Small", "Ginourmous", "Hungry", "Mini", "Round", "Squared", "Squishy"];
const nouns = ["Ball", "Car", "Phone", "Apple", "Phone", "Leaf", "Cat", "Frog", "Poet", "Actor", "Tea", "World", "Pear", "House", "Dot"];

var clients = [];

const sameUsername = (username) => {
    let same = false;
    clients.forEach(client => {
        if (client == username) {
            same = true;
        }
    });
    return same;
}

function generateRandomWord() {
    let random = (adjs[Math.floor(Math.random() * adjs.length)] + nouns[Math.floor(Math.random() * nouns.length)]);

    return sameUsername(random) ? generateRandomWord() : random;
}

const version = "0.3.0a";
let username = generateRandomWord();


function manageMessage(message, wss) {
    if (message.trim().startsWith("/")) {
        let command = slashCommand(message.trim());

        switch (command.command) {
            case "help":
                output.info(`
                    <<<<<<<<<<<<<<<<<
                    Chatium by nikeedev - client version: v${version}.

                    Send a message by just writing it and pressing enter. 
                    
                    Commands: 
                    /help - shows this page again.

                    /name - rename yourself.

                    /dm [username] [message] - sends a direct message to the specified username

                    /list - show list of online users
                    
                    --------------

                    More commands will be added later, you can watch the development on the GitHub repo of the chat:
                    https://github.com/nikeedev/chatium
                    >>>>>>>>>>>>>>>>>
                `);
                break;

            case "rename":
                let new_username = command.body.trim();

                console.log(new_username);

                if (!new_username.legalName()) {
                    output.error(`Username cannot include spaces or "/" slash symbol due to parsing reasons.`);
                }
                else if (sameUsername(new_username)) {
                    output.error(`Username is already in use. Please write another.`);
                }
                else {
                    ws.send(JSON.stringify({
                        type: "rename",
                        data: `${new_username}`,
                        user: `${username}`,
                        time: new Date().toLocaleTimeString()
                    }));
                }
                break;

            case "dm":
                let receiver = command.body.split(" ")[0];

                let msg = command.body.split(" ").filter((v, i) => i > 0).join(' ');

                clients.forEach(client => {
                    if (client == receiver) {
                        ws.send(JSON.stringify({
                            data: `${msg}`,
                            username: ws.username,
                            type: "message",
                            to: client,
                            time: new Date().toLocaleTimeString()
                        }));
                        output.info(`Direct message sent to @${client}`);
                    } else {
                        output.error(`User @${receiver} doesn't exist or is offline.`);
                    }
                })
                break;

            case "list":
                if (clients.length != 0) {
                    output.info("\n");
                    clients.forEach((client, i) => output.info(`${i + 1}. ${client.username}`))
                    output.info("\n");
                } else if (clients.length == 0) {
                    output.error("No users online...");
                } else if (ws == undefined) {
                    output.error("No users online. Chat server is down or your network connection is unstable.");
                } 
                break;

            default:
                output.error(`${command.slashcommand} command you provided doesn't exist. Use /help command to list available commands.`);
                break;
        }
    }
    else {
        wss.send(JSON.stringify({
            type: "message",
            username: username,
            data: message,
            time: new Date().toLocaleTimeString()
        }));
    }
}

const run = async () => {
    output.message("Chatium by nikeedev @ 2024\n\n");

    output.message(`
    -------
    For help use "/help" command
    -------
    `);

    // production
    // const wss = new WebSocket("wss://chat.nikee.dev");

    // dev
    const wss = new WebSocket("ws://127.0.0.1:8080");
    
    wss.send(JSON.stringify({
        type: "list",
        time: new Date().toLocaleTimeString()
    }));

    wss.onmessage = (ws) => {
        console.log(ws.data);

        /**
         * @typedef {Object} Message
         * @property {string} [username]
         * @property {string} data
         * @property {string} time
         * @property {string} [to]
         */

        /** @type {Message} */
        let message = JSON.parse(ws.data.toString());

        switch (message.type) {
            case "join":
                clients.push(message.data); 
                output.message(`${message.time}\t@${message.data} joined the server! Welcome @${message.da}!`);

                break;

            case "rename":
                clients[clients.indexOf(message.username)] = message.data; 
                output.info(`${message.time}\t@${message.username} changed their username to ${message.data}.`);

                break;

            case "message":
                if (message.to === undefined) {
                    output.message(`${message.time}\t@${message.user}: ${message.data}`);
                } else {
                    output.info(`Message sent from @${message.to}:`);
                    output.message(`${message.time}\t${message.data}`);
                }
                break;

            case "leave":
                output.info(`${message.time}\t${message.username} left the chat`);
                // console.log(`${ws.username} left the chat`);
                clients.splice(clients.indexOf(message.username), 1);
                ws.close();
                break;

            case "list":
                clients = JSON.parse(message.data);
                break;

            case "info":
                output.info(`${message.time}\tFrom server: ${message.data}`);
                break;

            default:
                ws.send(`${command.slashcommand} command doesn't exist. Use /help to see available commands.`)
                break;
        }
    };

    wss.onopen = (ws) => {
        window.addEventListener("keydown", function (e) {
            if (e.key == "Enter" && input.value != "") {
                manageMessage(input.value, wss);
                input.value = "";
            }
        });

        document.getElementById("send").addEventListener("click", function (e) {
            if (input.value != "") {
                manageMessage(input.value, wss);
                input.value = "";
            }
        });
    };

    wss.onclose = (ws) => {
        if (wss.readyState != 1 || wss.readyState != 0) {
            let closing_message = "Chat's server is either down or something is wrong with your network connection. Reload the page, or try again later.";
            console.log(closing_message);
            console.log(ws);
            output.error(closing_message);
        }
    };

    wss.onerror = (e) => {
        console.error("Error: ", e);
    };
};

run();