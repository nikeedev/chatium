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


const run = async () => {
    output.message("Chatium by nikeedev@2023\n\n");

    output.message(`
    -------
    For help use "/help" command
    -------
    `);

    // production
    const wss = new WebSocket("wss://chat.nikee.dev");

    // dev
    // const wss = new WebSocket("ws://localhost:8000");

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
                console.log("Sending message");
                wss.send(input.value);
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