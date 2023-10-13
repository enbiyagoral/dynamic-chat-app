require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const session = require('express-session');
const userRoute = require('./routes/userRoute');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET
}))



mongoose.connect(process.env.mongoURI)
    .then(()=>{console.log("MongoDB Connected!");});

app.use('/',userRoute);
app.use('*', (req,res)=>{
    res.redirect('/');
})
http.listen(3000, ()=>{
    console.log('Server starting on port : 3000');
})