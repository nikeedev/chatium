To-do list of the chat:

- [X] Add scrollbar to the messages
- [x] Add posibilty to change username
- [X] Add slash commands
- [X] Add `/msg` command which sends messasge to only that user that is written in the command. Here is how: 
```
/msg [username] [message]
```
- [X] Add server uptime command: `/uptime`. Returns the time since the server started.
- [ ] Add so that we send JSON with information about what we sent: is that message, a command for the client or command to stop connection; that way we can send one type of JSON each with useful information. Also the command parsing should happen at the client if we do that.
    - [ ] Add clear command so that we can clear the div from all those messages. 
          Again the parsing must therefore happen at client side.


updated 28.05.2023
