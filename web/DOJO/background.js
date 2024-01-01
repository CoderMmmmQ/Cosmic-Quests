// app.js
const express = require('express');
const app = express();
const path = require('path');

// 设置EJS模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 定义路由
app.get('/', (req, res) => {
    res.render('index');
});

// 启动服务器
const port = 3000;
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
