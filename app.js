require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const session = require('express-session');
const userRoute = require('./routes/userRoute');
const io = require('socket.io')(http);
const User = require('./models/userModel');
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET
}))

var usp = io.of('user-namespace');

usp.on('connection', async function(socket){
    console.log('User connected');
    var userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate({_id:userId}, { $set:{ isOnline: '1'}});

    // user boradcast online status
    socket.broadcast.emit('getOnlineUser', {user_id:userId})
    socket.on('disconnect',  async function(){
        console.log('User disconnected');
        var userId = socket.handshake.auth.token;
        await User.findByIdAndUpdate({_id:userId}, { $set:{ isOnline: '0'}});
        // user boradcast online status
        socket.broadcast.emit('getOfflineUser', {user_id:userId})
    });
})

mongoose.connect(process.env.mongoURI)
    .then(()=>{console.log("MongoDB Connected!");});

app.use('/',userRoute);
app.use('*', (req,res)=>{
    res.redirect('/');
})
http.listen(3000, ()=>{
    console.log('Server starting on port : 3000');
})