const db = require("../config/db");

/**
 * Add comment to a post
 */
exports.addComment = (req, res) => {
  const user = req.user;
  const postId = req.params.postId;
  const { content } = req.body;

  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (!content) return res.status(400).json({ message: "Comment content is required" });

  const sql = "INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)";
  db.query(sql, [user.id, postId, content], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error adding comment" });

    const commentId = result.insertId;
    db.query(
      "SELECT c.*, u.username, u.profile_pic FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?",
      [commentId],
      (err2, rows) => {
        if (err2) return res.status(500).json({ message: "DB error fetching comment" });
        res.status(201).json({ comment: rows[0] });
      }
    );
  });
};

/**
 * Get comments for a post
 */
exports.getCommentsForPost = (req, res) => {
  const postId = req.params.postId;

  const sql = `
    SELECT c.*, u.username, u.profile_pic
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;
  db.query(sql, [postId], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error fetching comments" });
    res.json({ comments: rows });
  });
};
