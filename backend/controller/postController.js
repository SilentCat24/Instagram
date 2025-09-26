const db=require('../config/db');
const path=require('path')
const fs=require('fs')

const MEDIA_BASE = process.env.MEDIA_BASE || "http://localhost:4000/uploads/";

exports.createPost = (req, res) => {
  const user = req.user; // from verifyToken middleware
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const content = req.body.content || null;
  let media = null;
  let media_type = null;

  if (req.file) {
    media = req.file.filename; // stored filename
    media_type = req.file.mimetype.split("/")[0]; // 'image'
  }

  if (!content && !media) {
    return res.status(400).json({ message: "Post must contain text or media" });
  }

  const sql = "INSERT INTO posts (user_id, content, media, media_type) VALUES (?, ?, ?, ?)";
  db.query(sql, [user.id, content, media, media_type], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error creating post" });
    }
    const postId = result.insertId;
    db.query("SELECT p.*, u.username, u.profile_pic FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ? LIMIT 1", [postId], (err2, rows) => {
      if (err2) return res.status(500).json({ message: "DB error" });
      const post = rows[0];
      if (post.media) post.media = MEDIA_BASE + post.media;
      res.status(201).json({ message: "Post created", post });
    });
  });
};

/**
 * Get feed (paginated)
 * Query params: page (default 1), limit (default 10)
 * Returns posts sorted by created_at DESC
 */
exports.getPosts = (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;

  const sql = `
    SELECT p.*, u.username, u.profile_pic
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  db.query(sql, [limit, offset], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error fetching posts" });
    }
    const posts = rows.map(r => {
      if (r.media) r.media = MEDIA_BASE + r.media;
      return r;
    });
    res.json({ page, limit, posts });
  });
};

/**
 * Get single post by id
 */
exports.getPostById = (req, res) => {
  const id = req.params.id;
  const sql = "SELECT p.*, u.username, u.profile_pic FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ? LIMIT 1";
  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (!rows.length) return res.status(404).json({ message: "Post not found" });
    const post = rows[0];
    if (post.media) post.media = MEDIA_BASE + post.media;
    res.json({ post });
  });
};

/**
 * Delete post (only owner)
 */
exports.deletePost = (req, res) => {
  const user = req.user;
  const id = req.params.id;

  // check owner
  db.query("SELECT * FROM posts WHERE id = ? LIMIT 1", [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (!rows.length) return res.status(404).json({ message: "Post not found" });
    const post = rows[0];
    if (post.user_id !== user.id) return res.status(403).json({ message: "Forbidden" });

    // delete file if exists
    if (post.media) {
      const filePath = path.join(__dirname, "..", "uploads", post.media);
      fs.unlink(filePath, (unlinkErr) => {
        // ignore unlink errors but log
        if (unlinkErr && unlinkErr.code !== "ENOENT") console.error("Error deleting file:", unlinkErr);
      });
    }

    db.query("DELETE FROM posts WHERE id = ?", [id], (delErr) => {
      if (delErr) return res.status(500).json({ message: "DB error deleting post" });
      res.json({ message: "Post deleted" });
    });
  });
};