import server from websocket;


server.on("connection", function(socket : any) {
    console.log("user connected");
    socket.emit("welcome", "welcome man");
});
