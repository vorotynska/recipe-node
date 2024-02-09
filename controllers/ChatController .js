const Message = require("../models/message");

module.exports = io => {
    io.on("connection", client => {
        console.log("new connection");

        client.on("disconnect", () => {
            console.log("user disconnected");
        });

        client.on("message", (data) => {
            let messageAttributes = {
                    content: data.content,
                    userName: data.userName,
                    user: data.userId
                },
                m = new Message(messageAttributes);
            m.save()
            Message.find({})
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .then(messages => {
                    client.emit("load all messages",
                        messages.reverse());
                });
        });
    });
};