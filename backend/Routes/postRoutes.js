const express=require('express')
const router=express.Router();
const upload=require('../middleware/upload');
const {verifyToken}=require('../middleware/authMidlleware');
const postController=require('../controller/postController');


// console.log('DEBUG: verifyToken ->', typeof verifyToken, verifyToken && verifyToken.name);
// console.log('DEBUG: upload ->', typeof upload, 'hasSingle:',
//   upload && typeof upload.single === 'function');
// console.log('DEBUG: postController ->', typeof postController, Object.keys(postController || {}));



router.post("/", verifyToken, upload.single("media"), postController.createPost);

// get feed
router.get("/", postController.getPosts);

// get single post
router.get("/:id", postController.getPostById);

// delete post (owner)
router.delete("/:id", verifyToken, postController.deletePost);

module.exports = router;