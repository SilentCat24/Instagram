const express = require("express");
const dotenv = require("dotenv");
const routes =require('./Routes/routes')
const db = require("./config/db");
const userRoutes=require('./Routes/routes')
const { verifyToken } = require("./middleware/authMidlleware");
const passport = require("passport");
const path = require("path");
const postRoutes=require('./Routes/postRoutes');
const likeRoutes=require('./Routes/likedRoutes')
const commentRoute=require('./Routes/commentRoute')
const feedRoutes=require('./Routes/feedRoutes')


const authRoutes = require("./Routes/authRoutes");


dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);
require("./config/passport")(passport);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use(passport.initialize());
app.use("/api/likes", likeRoutes);
app.use("api/comments",commentRoute)
app.use("/api/feed", feedRoutes);



app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.send("Social Media Backend Running");
});





const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
