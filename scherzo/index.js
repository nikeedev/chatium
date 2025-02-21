const { WebSocket } = require('ws');
require('dotenv').configDotenv();
const axios = require('axios');
const { openWeatherWMOToEmoji } = require("@akaguny/open-meteo-wmo-to-emoji");

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
        // console.log("ws data: " + ws.data);
        // console.log(clients);

        /** @type {Message} */
        let message = JSON.parse(ws.data.toString());
        // console.log(message);

        switch (message.type) {
            case "join":
                clients.push({ name: message.data, xp: 0, level: 0 });
                console.log(`${message.time}\t@${message.data} joined the server! Welcome @${message.data}!`);
                break;

            case "list":
                // console.log(message.data);
                message.data.forEach(client => {
                    if (!clients.includes(client)) {
                        clients.push({ name: client, xp: 0, level: 0 });
                    }
                });
                console.log(clients);
                break;

            case "rename":
                clients[clients.map(client => client.name).indexOf(message.username)].name = message.data;
                console.log(clients.indexOf(message.username));
                console.info(`${message.time}\t@${message.username} changed their username to ${message.data}.`);

                break;

            case "message":
                // console.log(`${message.time}\t${message.username}: ${message.data}`);
                if (message.data.startsWith("..")) {
                    message.data = message.data.slice(2);
                    let command = message.data.split(" ")[0];
                    let args = message.data.split(" ").slice(1);

                    switch (command) {
                        case "cmds":
                            wss.send(JSON.stringify({
                                type: "message",
                                data: `@${message.username}: Available commands: \n\t..cmds, \n\t..weather <city>, \n\t..level/..xp`,
                                username: scherzo.name,
                                time: new Date().toLocaleTimeString()
                            }));
                            break;

                        case "weather":
                            let city = args.join(" ");
                            axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`).then((response) => {
                                let lat = response.data.results[0].latitude, lon = response.data.results[0].longitude;

                                axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=ms`).then((response) => {
                                    let temp = response.data.current.temperature_2m;
                                    let wind_speed = response.data.current.wind_speed_10m;
                                    let emoji = openWeatherWMOToEmoji(response.data.current.weather_code).value;


                                    wss.send(JSON.stringify({
                                        type: "message",
                                        username: scherzo.name,
                                        data: `@${message.username}: Weather in ${city}: ${emoji} ${temp}°C (wind speed ${wind_speed}m/s)`,
                                        time: new Date().toLocaleTimeString()
                                    }));
                                });
                            });
                            break;

                        case "level":
                        case "xp":
                            let xp = clients[clients.map(client => client.name).indexOf(message.username)].xp;
                            let level = clients[clients.map(client => client.name).indexOf(message.username)].level;
                            wss.send(JSON.stringify({
                                type: "message",
                                username: scherzo.name,
                                data: `@${message.username}: You have ${xp} xp and you are level ${level}.`,
                                time: new Date().toLocaleTimeString()
                            }));

                            break;
                    }
                } else {
                    let index = clients.findIndex(client => client.name === message.username);
                    if (index !== -1) {
                        console.log(clients[clients.map(client => client.name).indexOf(message.username)]);
                        clients[clients.map(client => client.name).indexOf(message.username)].xp += message.data.length;
                        if (clients[clients.map(client => client.name).indexOf(message.username)].xp >= 100) {
                            clients[clients.map(client => client.name).indexOf(message.username)].xp -= 100;
                            clients[clients.map(client => client.name).indexOf(message.username)].level += 1;
                            wss.send(JSON.stringify({
                                type: "message",
                                username: scherzo.name,
                                data: `@${message.username} has leveled up! They are now level ${clients[clients.map(client => client.name).indexOf(message.username)].level}!`,
                                time: new Date().toLocaleTimeString()
                            }));
                        }
                    } else {
                        console.error(`User ${message.username} not found in clients list.`);
                    }
                }

                break;

            case "leave":
                console.info(`${message.time}\t${message.username} left the chat`);
                // console.log(`${ws.username} left the chat`);
                clients.splice(clients.indexOf(message.username), 1);
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