/** @type {HTMLInputElement} */
const input = document.getElementById("input");

/** @type {HTMLDivElement} */
const output = document.getElementById("output");

output.style.width = `${window.innerWidth - 40}px`;
output.style.height = `${window.innerHeight - 40}px`;
input.style.width = `${window.innerWidth - 40}px`;

Element.prototype.message = function (message) {
    this.innerText += `${message}\n`;
}

Element.prototype.info = function (message) {
    this.innerHTML += `<p style="color:blue">${message}</p><br />`;
}

Element.prototype.error = function (message) {
    this.innerHTML += `<p style="color:red">${message}</p><br />`;
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

const version = "0.3.0a";

function sendMessage(message) {
    if (message.trim().startsWith("/")) {
        let command = slashCommand(message.trim());

        switch (command.command) {

            case "help":
                ws.send(`
                    <<<<<<<<<<<<<<<<<
                    Chatium by nikeedev - client version: v${version}.

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
                output.info(`\n`);
                clients.forEach((client, i) => output.info(`${i + 1}: ${client.username}`))
                output.info(` Last to join ↑`)
                output.info(`\n`);
                break;

            default:
                ws.send(`${command.slashcommand} command doesn't exist. Use /help to see available commands.`)
                break;
        }
    }
    else {
        wss.send(JSON.stringify({
            type: "message",
            username: wss.username,
            data: message
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
    const wss = new WebSocket("ws://localhost:8000");

    console.log(wss)

    wss.onmessage = (ws) => {
        console.log(ws.data);
        output.message(ws.data);
    };

    wss.onopen = (ws) => {
        window.addEventListener("keydown", function (e) {
            if (e.key == "Enter" && input.value != "") {
                wss.send(input.value);
                input.value = "";
            }
        });

        document.getElementById("send").addEventListener("click", function (e) {
            if (input.value != "") {
                
                input.value = "";
            }
        });
    };

    wss.onclose = () => {
        let closing_message = "Chat's server is either down or something is wrong with your network connection. Reload the page, or try again later.";
        console.log(closing_message);
        output.error(closing_message);
    };

    wss.onerror = (e) => {
        console.log("Error");
    };
};

run();