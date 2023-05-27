/** @type {HTMLInputElement} */
const input = document.getElementById("input");

/** @type {HTMLDivElement} */
const output = document.getElementById("output");

/** @type {HTMLInputElement} */
const username_input = document.getElementById("username");

/** @type {HTMLButtonElement} */
const join = document.getElementById("join");

let username = "";

input.style.display = "none";
output.style.display = "none";

output.style.width = `${window.innerWidth - 40}px`;
output.style.height = `${window.innerHeight - 40}px`;
input.style.width = `${window.innerWidth - 40}px`;

join.onclick = () => {
    let username_check = username_input.value.trim();
    if (!username_check.length >= 0) {
        username = JSON.stringify({username:username_check});
        document.getElementById("login").remove();

        input.style.display = "block";
        output.style.display = "flex";

        run();
    }
}


async function run() {
    
    // production
    const wss = new WebSocket("ws://165.232.90.211/server");
    
    // dev
    // const wss = new WebSocket("ws://localhost:8800");
    
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

        let executed = false;
        while (!executed) {
            return function() {
                if (!executed) {
                    executed = true;
                    wss.send(username);
                    console.log(username);
                }
            }();
        }
    };

    wss.onclose = () => {
        console.log("Sorry, have to go!");
    };

    wss.onerror = (e) => {
        console.log("Error");
    };
};
