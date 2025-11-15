const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// To parse the body of the request if the content-type is 'application/json'
app.use(express.json()); 

// To attach session object to the request
app.use("/customer", session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// To reject requests sent by non-authenticated users
app.use("/customer/auth/*", function auth(req,res,next){
    if(!req.session.authorization){
        return res.status(403).json({message: "Unauthorized access"});
    } 
    next();
});

// 
app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT =5000;

app.listen(PORT,()=>console.log("Server is running"));
