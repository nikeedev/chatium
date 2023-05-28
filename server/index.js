const { version } = require('./package.json');

// Modified version of krismuniz's slash-command repo - github - MIT License

const slashCommand = (s) => {
    let cmds = s.split(' ')[0].match(/\/([\w-=:.@]+)/ig);
    let slashcmds;
    let body = s.trim();
  
    if (cmds) {
      slashcmds = cmds.join('');
      cmds = cmds.map(x => x.replace('/',''));
      body = s.split(' ').filter((v, i) => i > 0).join(' ').trim() || null;
    }
  
    return {
      slashcommand: slashcmds,
      command: cmds ? cmds[0] : null,
      body: body,
      original: s
    };
};

String.prototype.legalName = function () {
    return !/\s/g.test(this.valueOf()) && !/\//g.test(this.valueOf());
}

const uptime = new Date();

const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({port: 8800})

let clients = [];

wss.on('connection', (ws) => {

    ws.on('message', (msg) => {
        let message = msg.toString();
        if (slashCommand(message).command == "join" && ws.username === undefined)
        {
            let username = slashCommand(message).body.trim();
            console.log(username);
            if (!username.legalName()) {
                ws.send(`Your username cannot include spaces or special characters like /`);
            }
            else {
                ws.username = username;
                
                console.log(`username ${ws.username} joined`);

                ws.send(`Hello ${ws.username}! Welcome to the chat! Server version: v${version}`);

                sendAll(`${ws.username} has joined the chat`);

                clients.push(ws);
            }
            
        }
        else if (message.trim().startsWith("/")) {
            let command = slashCommand(message.trim());
            console.log(command);
            switch (command.command) {
                case "help":
                    ws.send(`
                        <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                        Chatium by nikeedev - server version: v${version}.

                        Send a message by just writing it and pressing enter. 
                        
                        Commands: 
                        /help - shows this page again.

                        /msg [username] [message] - sends a message to the specified username

                        /uptime - shows the time since the server was started up.

                        --------------

                        More commands will be added later, you can watch the development on the GitHub repo of the chat:
                        https://github.com/nikeedev/chatium
                        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                    `);
                    break;
                    
                case "msg":
                    let reciever = command.body.split(" ")[0];

                    let message = command.body.split(" ").filter((v, i) => i > 0).join(' ');

                    clients.forEach(client => {
                        if (client.username == reciever)
                        {
                            client.send(`From @${ws.username}: ${message}`);
                        }
                    })
                    break;

                case "uptime":
                    var ms = Math.abs(new Date() - uptime);
                    const secs = Math.floor(Math.abs(ms) / 1000);
                    const mins = Math.floor(secs / 60);
                    const hours = Math.floor(mins / 60);
                    const days = Math.floor(hours / 24);
                    ws.send(`
                        \nOnline for: ${days} day(s), ${hours} hours, ${mins} mins, and ${secs} seconds.\n
                    `);
                    break;

                default:
                    ws.send(`${command.slashcommand} command doesn't exist. Use /help to see available commands.`)
                    break;
            }
        }
        else if (ws.username != "") {
            console.log("received: ", `${ws.username}: ${message}`);
        
            sendAll(`${ws.username}: ${message}`);
        }
    });

   
    

});

const sendAll = (message) => {
    clients.forEach(client => {
        client.send(message);
    });
}
