Done:
- [X] Add scrollbar to the messages
- [x] Add posibilty to change username
- [X] Add slash commands
- [X] Add `/msg` command which sends messasge to only that user that is written in the command. Here is how: 
```
/msg [username] [message]
```
- [X] Add server uptime command: `/uptime`. Returns the time since the server started.

Todo:
- [ ] Add so that we send JSON with information about what we sent: is that message, a command for the client or command to stop connection; that way we can send one type of JSON each with useful information. Also the command parsing should happen at the client if we do that.
    - [ ] Add clear command so that we can clear the div from all those messages. 
          Again the parsing must therefore happen at client side.

- [ ] Sens message to user who sends dm to the other user, about that the dm was sent, cause it doesnt show up 

updated 29.05.2023
