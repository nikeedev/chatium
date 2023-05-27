/** @type {HTMLInputElement} */
const input = document.getElementById("input");

/** @type {HTMLDivElement} */
const output = document.getElementById("output");


output.style.width = `${window.innerWidth - 40}px`;
output.style.height = `${window.innerHeight - 20}px`;

input.style.width = `${window.innerWidth - 40}px`;

(async () => {
    
    const wss = new WebSocket("ws://165.232.90.211/server");
    
    console.log(wss)

    wss.onmessage = (ws) => {
        console.log(ws.data);
        output.innerText += `${ws.data}\n`
    };

    wss.onopen = (ws) => {
        window.addEventListener("keydown", function(e) {
            if(e.key == "Enter") {
                wss.send(input.value);
                input.value = "";
            }
        });

    };

    wss.onclose = () => {
        console.log("Sorry, have to go!");
    };

    wss.onerror = (e) => {
        console.log("Error");
    };
})();
