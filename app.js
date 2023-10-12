require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const userRoute = require('./routes/userRoute');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));


mongoose.connect(process.env.mongoURI)
    .then(()=>{console.log("MongoDB Connected!");});

app.use('/',userRoute);

http.listen(3000, ()=>{
    console.log('Server starting on port : 3000');
})