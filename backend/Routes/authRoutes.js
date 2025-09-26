const express = require("express");
const router = express.Router();
const passport = require("passport");
const {login,oauthCallback}=require('../controller/authController')

router.post("/login", login);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));


router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  oauthCallback
);


module.exports = router;