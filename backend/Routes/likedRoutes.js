const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMidlleware");
const likeController = require("../controller/likeController");

// like/unlike post
router.post("/:postId/toggle", verifyToken, likeController.toggleLike);

// get likes of a post
router.get("/:postId", likeController.getLikesForPost);

module.exports = router;
