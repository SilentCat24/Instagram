const db = require("../config/db");

exports.toggleLike = (req, res) => {
  const user = req.user;
  const postId = req.params.postId;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  // Check if already liked
  const checkSql = "SELECT * FROM likes WHERE user_id = ? AND post_id = ?";
  db.query(checkSql, [user.id, postId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (results.length > 0) {
      // Already liked → remove like
      const deleteSql = "DELETE FROM likes WHERE user_id = ? AND post_id = ?";
      db.query(deleteSql, [user.id, postId], (err2) => {
        if (err2) return res.status(500).json({ message: "DB error removing like" });

        // Decrement likes count
        db.query("UPDATE posts SET likes = likes - 1 WHERE id = ?", [postId]);
        return res.json({ message: "Like removed" });
      });
    } else {
      // Add like
      const insertSql = "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";
      db.query(insertSql, [user.id, postId], (err2) => {
        if (err2) return res.status(500).json({ message: "DB error adding like" });

        // Increment likes count
        db.query("UPDATE posts SET likes = likes + 1 WHERE id = ?", [postId]);
        return res.json({ message: "Post liked" });
      });
    }
  });
};

exports.getLikesForPost = (req, res) => {
  const postId = req.params.postId;

  const sql = `
    SELECT l.user_id, u.username, u.profile_pic, l.created_at
    FROM likes l
    JOIN users u ON l.user_id = u.id
    WHERE l.post_id = ?
    ORDER BY l.created_at DESC
  `;
  db.query(sql, [postId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error fetching likes" });
    res.json({ likes: rows });
  });
};
