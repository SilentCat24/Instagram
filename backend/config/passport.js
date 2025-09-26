const passport=require('passport');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db=require('./db');

module.exports = function(passportInstance) {
  passportInstance.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const oauthId = profile.id;
      const provider = "google";
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || null;
      const username = profile.displayName || email || `user_${oauthId}`;
      const profilePic = (profile.photos && profile.photos[0] && profile.photos[0].value) || null;

      // find user
      const findSql = "SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ? LIMIT 1";
      db.query(findSql, [provider, oauthId], (err, results) => {
        if (err) return done(err);

        if (results.length > 0) {
          // user exists
          return done(null, results[0]);
        } else {
          // create user
          const insertSql = `INSERT INTO users (username, email, password, oauth_provider, oauth_id, profile_pic)
                             VALUES (?, ?, NULL, ?, ?, ?)`;
          db.query(insertSql, [username, email, provider, oauthId, profilePic], (err2, res2) => {
            if (err2) return done(err2);
            const newUserId = res2.insertId;
            db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [newUserId], (err3, rows3) => {
              if (err3) return done(err3);
              return done(null, rows3[0]);
            });
          });
        }
      });

    } catch (error) {
      return done(error);
    }
  }));
};
