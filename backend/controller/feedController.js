const db = require("../config/db");

exports.getFeed = (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;

  const postsSql = `
    SELECT p.*, u.username, u.profile_pic
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(postsSql, [limit, offset], (err, posts) => {
    if (err) return res.status(500).json({ message: "DB error fetching posts" });

    if (!posts.length) return res.json({ page, limit, posts: [] });

    const postIds = posts.map(p => p.id);

    const likesSql = `
      SELECT l.post_id, u.id AS user_id, u.username, u.profile_pic, l.created_at
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id IN (?)
      ORDER BY l.created_at DESC
    `;

    const commentsSql = `
      SELECT c.post_id, c.id AS comment_id, c.user_id, c.content, c.created_at, u.username, u.profile_pic
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id IN (?)
      ORDER BY c.created_at ASC
    `;

    db.query(likesSql, [postIds], (errLikes, likes) => {
      if (errLikes) return res.status(500).json({ message: "DB error fetching likes" });

      db.query(commentsSql, [postIds], (errComments, comments) => {
        if (errComments) return res.status(500).json({ message: "DB error fetching comments" });

        // attach likes and comments to posts
        const postsWithExtras = posts.map(post => {
          const postLikes = likes.filter(l => l.post_id === post.id);
          const postComments = comments.filter(c => c.post_id === post.id);
          return {
            ...post,
            media: post.media ? `${process.env.MEDIA_BASE || "http://localhost:4000/uploads/"}${post.media}` : null,
            likes_count: post.likes,
            likes: postLikes,
            comments: postComments
          };
        });

        res.json({ page, limit, posts: postsWithExtras });
      });
    });
  });
};
