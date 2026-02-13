require("dotenv").config();
const express = require("express");
const connectToMongo = require("./db");
const cors = require("cors");
const app = express()
const port = process.env.PORT || 5000;


connectToMongo();  


app.use(cors());
app.use(express.json());

app.use('/api/auth/signup',require('./routes/adduser')) 
app.use('/api/auth/login',require('./routes/loginuser'))
app.use('/api/auth/deleteuser',require('./routes/deleteuser'))   
app.use("/api/auth/forgot-password", require('./routes/forgotpassword'));
app.use("/api/auth/reset-password", require("./routes/resetpassword"));
app.use("/api/courses", require("./routes/courseroutes"));
app.use("/api", require("./routes/lessonRoutes"));
app.use("/api", require("./routes/quizRoutes"));
app.use("/api", require("./routes/questionRoutes"));
app.use("/api", require("./routes/enrollmentRoutes"));
app.use("/api", require("./routes/practiceAttemptRoutes"));
app.use("/api/admin", require("./routes/adminUserRoutes"));

app.listen(port, () => {
  console.log(`UOC Backend listening on port ${port}`)
})