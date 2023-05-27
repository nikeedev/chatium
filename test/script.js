/** @type {HTMLInputElement} */
const input = document.getElementById("input");
const output = document.getElementById("output");
const button = document.getElementById("send");



(async () => {
    
    const wss = new WebSocket("ws://165.232.90.211:8800");
    
    console.log(wss)

    wss.onmessage = (ws) => {
        console.log(ws.data);
        output.innerText += `${ws.data}\n`
    };

    wss.onopen = (ws) => {
        button.addEventListener("click", function() {
            wss.send(input.value);
            input.value = "";
        });

    };

    wss.onclose = () => {
        console.log("Sorry, have to go!");
    };

    wss.onerror = (e) => {
        console.log("Error");
    };
})();
