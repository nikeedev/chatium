# The idea for the new "protocol"/system for managing client and server connections

With this new system that I (nikeedev) created, sending messages using websockets will be a lot easier now that the messages will be just stringified JSON's.

Each message will send a status value, username value, and data value depending on the status.


## Here is how my chat will use my new protocol:

So when a user opens the client and writes a name, and joins, the user will be connected and following message will be sent to the server:

```jsonc
{
    "status": "join",
    "username": "Foo",
}
```

This message is going to be parsed at the server side and after understanding the message the server will send same message to the all connected clients but not the user who joined that time. An array of users will be saved on the server side and client side so that both know which users are online.

Next, if a user decides to send a message, this message will be sent to the server: 

```jsonc
{
    "status": "message",
    "username": "Foo",
    "data": "Hello, world!" 
}
```

The message will be sent to the server, and then to all clients with name being the senders name.

For DM's:

```jsonc
{
    "status": "dm",
    "username": "Foo",
    "data": "Hello, world!",
    "to": "Bar"
}
```

The "to" parameter specifies what user(name) will get the message, so that not everybody gets to read it. 