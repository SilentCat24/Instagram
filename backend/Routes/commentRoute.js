const express=require('express')
const router=express.Router();
const {verifyToken}=require('../middleware/authMidlleware')
const commentController=require('../controller/commentController')


router.post("/:postId", verifyToken, commentController.addComment);

// get comments for a post
router.get("/:postId", commentController.getCommentsForPost);

module.exports = router;