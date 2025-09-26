const express=require('express');
const router=express.Router();
const {getFeed}=require('../controller/feedController');

router.get('/',getFeed)


module.exports=router;