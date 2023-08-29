const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 5000;
const cors = require('cors');
const { Server } = require("socket.io");
app.use(cors());
const io = new Server(server,{
    cors: {
      origin: "*",
      handlePreflightRequest: (req,res)=>{
        res.writeHead(200,{
            "Access-Control-Allow-origin":"*",
            "Access-Control-Allow-Methods":"GET,POST",
            "Access-Control-Allow-Headers": "my-custom-header"
        })
      }
    }
  });

const user = {};

io.on('connection', socket =>{
    socket.on('new-user-joined', name=>{
        user[socket.id]=name;
        socket.broadcast.emit('user-joined',{name,message: "joined"});
        socket.emit('user-joined',{name: "You", message: "joined"});
    })
    
    socket.on('sendMessage',message=>{
        socket.broadcast.emit('receivedMessage',{name: user[socket.id], message});
        socket.emit('sentMessage',{name: "You", message});
    })

    socket.on('disconnect', ()=>{
        socket.broadcast.emit('user-left',{name: user[socket.id],message: "left"});
        delete user[socket.id];
        socket.emit('user-left',{name: "You", message: "left"});
    })
})


server.listen(port, ()=>{
    console.log("Listening on port "+port);
})