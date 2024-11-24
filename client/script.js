/** @type {HTMLInputElement} */
const input = document.getElementById("input");

/** @type {HTMLDivElement} */
const output = document.getElementById("output");

output.style.width = `${window.innerWidth - 40}px`;
output.style.height = `${window.innerHeight - 60}px`;
input.style.width = `${window.innerWidth - 60}px`;

Element.prototype.message = function (message, nl = true) {
    let p = document.createElement("p");
    p.innerText = message;
    this.insertBefore(p, this.firstChild);
    if (nl) this.insertBefore(document.createElement("br"), this.firstChild);
}

Element.prototype.info = function (message, nl = true) {
    let p = document.createElement("p");
    p.style.color = "blue";
    p.innerText = message;
    this.insertBefore(p, this.firstChild);
    if (nl) this.insertBefore(document.createElement("br"), this.firstChild);
}

Element.prototype.error = function (message, nl = true) {
    let p = document.createElement("p");
    p.style.color = "red";
    p.innerText = message;
    this.insertBefore(p, this.firstChild);
    if (nl) this.insertBefore(document.createElement("br"), this.firstChild);
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

/**
 * @typedef {Object} Message
 * @property {string} [username]
 * @property {string} data
 * @property {string} time
 * @property {string} [to]
*/

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

/**
 * 
 * @param {Message} message 
 * @param {WebSocket} wss 
 */
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
                    wss.send(JSON.stringify({
                        type: "rename",
                        data: `${new_username}`,
                        user: `${username}`,
                        time: new Date().toLocaleTimeString()
                    }));
                    username = new_username;
                    output.info(`Username changed to ${new_username}!`);
                }
                break;

            case "dm":
                let receiver = command.body.split(" ")[0];

                let msg = command.body.split(" ").filter((v, i) => i > 0).join(' ');

                let found = false;
                clients.forEach(client => {
                    if (client == receiver) {
                        found = true;
                        wss.send(JSON.stringify({
                            data: `${msg}`,
                            username: username,
                            type: "message",
                            to: client,
                            time: new Date().toLocaleTimeString()
                        }));
                    }
                });
                if (!found)
                    output.error(`User @${receiver} doesn't exist or is offline.`);
                break;

            case "list":
                output.info("Online users:");
                if (clients.length != 0) {
                    clients.forEach((client, i) => output.info(`${i + 1}. ${client}`, false));
                } else if (clients.length == 0) {
                    output.error("No users online...");
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

let once = false;

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

    wss.onmessage = (ws) => {
        // console.log(ws.data);

        /** @type {Message} */
        let message = JSON.parse(ws.data.toString());

        switch (message.type) {
            case "join":
                clients.push(message.data);
                output.message(`${message.time}\t@${message.data} joined the server! Welcome @${message.data}!`, false);

                break;

            case "rename":
                clients[clients.indexOf(message.username)] = message.data;
                console.log(clients.indexOf(message.username));
                output.info(`${message.time}\t@${message.username} changed their username to ${message.data}.`, false);

                break;

            case "message":
                console.log(message);
                console.log(!message.hasOwnProperty('to'));
                if (!message.hasOwnProperty('to')) {
                    output.message(`${message.time}\t@${message.username}: ${message.data}`);
                } else {
                    output.info(`DM from @${message.username}:`);
                    output.message(`${message.time}\t @${message.username}: ${message.data}`);
                }
                break;

            case "leave":
                output.info(`${message.time}\t${message.username} left the chat`);
                // console.log(`${ws.username} left the chat`);
                clients.splice(clients.indexOf(message.username), 1);
                break;

            case "list":
                // console.log(message.data);
                message.data.forEach(client => {
                    if (!clients.includes(client)) {
                        clients.push(client);
                    }
                });
                // console.log(clients);
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
        if (!once) {
            once = true;
            wss.send(JSON.stringify({
                type: "join",
                data: username,
                time: new Date().toLocaleTimeString()
            }));
            clients.push(username);
        }

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
            // console.log(closing_message);
            // console.log(ws);
            output.error(closing_message);
        }
    };

    wss.onerror = (e) => {
        console.error("Error: ", e);
    };
};

run();