const { WebSocket } = require('ws');

// Enter chatium server address here (e.g. 'ws://localhost:8080' , port 8080 is default server port for a chatium server) 
const wss = new WebSocket('ws://localhost:8080');

// Extermin bot info
const extermin = {
    token: "Y2lLMHk2M3V2dkxPMzhWQ3dPeWVrOHV6djRyQnBTcmhBV2FxQURoUTI=",
    name: "Extermin",
    access: ["mod"]
};

let once = false;

wss.onmessage = (ws) => {
    // console.log(ws.data);

    /** @type {Message} */
    let message = JSON.parse(ws.data.toString());

    console.log(message);
};

wss.onopen = (ws) => {
    if (!once) {
        once = true;
        wss.send(JSON.stringify(
            {
                type: "bot.join", 
                data: { 
                    username: extermin.name, 
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