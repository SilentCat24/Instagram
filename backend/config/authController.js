const db=require('./db');
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken');


function signToken(user){
    const payload={id:user.id,username:user.username};
 return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

}


exports.login=(req,res)=>{
    const {email,password}=req.body;
     if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const sql='select * from users where email=? LIMIT 1';
    db.query(sql,[email],(err,results)=>{
        if(err){
            console.error(err);
            return res.status(500).json({message:"Db Error"});
        }
    })
}

exports.oauthCallback = (req, res) => {

  if (!req.user) return res.status(500).json({ message: "No user from OAuth" });
  const token = signToken(req.user);
  const html = `
  <html>
    <body>
      <script>
        (function() {
          const token = "${token}";
          // If opened as popup, send token to opener and close
          if (window.opener) {
            window.opener.postMessage({ token }, "*");
            window.close();
          } else {
            // otherwise show token
            document.body.innerText = "Login successful. Token:\\n" + token;
          }
        })();
      </script>
    </body>
  </html>
  `;
  res.send(html);
};