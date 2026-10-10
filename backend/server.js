require("dotenv").config({ override: true });
const express = require("express");
const connectToMongo = require("./db");
const cors = require("cors");
const app = express()
const port = process.env.PORT || 5000;


connectToMongo();  

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "UOC Backend is running",
  });
});
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
app.use("/api", require("./routes/attemptRoutes"));
app.use("/api/admin", require("./routes/adminUserRoutes"));
app.use("/api/ai", require("./routes/aiTutorRoutes"));
app.use("/api/practice", require("./routes/practiceRoutes"));

app.listen(port, () => {
  console.log(`UOC Backend listening on port ${port}`)
})