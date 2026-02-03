require("dotenv").config();
const express = require("express");
const connectToMongo = require("./db");
const cors = require("cors");
const app = express()
const port = process.env.PORT || 5000;


connectToMongo();  


app.use(cors());
app.use(express.json());

app.use('/api/signup',require('./routes/adduser')) 
app.use('/api/login',require('./routes/loginuser'))
app.use('/api/deleteuser',require('./routes/deleteuser'))   
app.use("/api/auth/forgot-password", require('./routes/forgotpassword'));
app.use("/api/auth/reset-password", require("./routes/resetpassword"));

app.listen(port, () => {
  console.log(`UOC Backend listening on port ${port}`)
})