const express = require('express');
const path = require('path');
const app = express();
const main = require("./route/main.js")
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.set("views",path.join(__dirname,"views"));
//get 메서드
app.use("/main",main);
app.get('/', (req, res) => {
    //200 응답을 지정하고, 메시지를 전송한다.
    res.status(200).send(app.cache);
});
app.use(express.static("views"));

//post 메서드
app.post('/write', (req, res) => {
    /* code */
});

//서버 실행
app.listen(8082, () => {
    console.log('start express server');
});