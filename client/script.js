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

const update = () => {
    output.style.width = `${window.innerWidth - 40}px`;
    output.style.height = `${window.innerHeight - 40}px`;
    input.style.width = `${window.innerWidth - 40}px`;

    requestAnimationFrame(update);
}
requestAnimationFrame(update);

const run = async () => {
    output.message("Chatium by nikeedev @ 2023\n\n");
   
    //changelog
    output.message("Changelog: \n")
    await fetch('current_changelog.txt')
    .then(response => response.text())
    .then(text => output.message(text))
    
    output.message(`
    -------
    Write "/join [your_username]", to begin talking!\n\rFor help use "/help" command
    -------
    `);

    // production
    // const wss = new WebSocket("ws://165.232.90.211/server");
    
    // dev
    const wss = new WebSocket("ws://localhost:8800");
    
    console.log(wss)
    
    wss.onmessage = (ws) => {
        console.log(ws.data);
        output.message(ws.data);
    };

    wss.onopen = (ws) => {
        window.addEventListener("keydown", function(e) {
            if(e.key == "Enter" && input.value != "") {
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