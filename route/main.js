var express = require('express');
var router = express.Router();


router.get("/",(req,res)=>{
    // res.send(this.toString navigator.mediaDevices);
    res.render("main2.html");
    // res.send();
    

})

module.exports = router;