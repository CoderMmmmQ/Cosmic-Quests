// app.js
const express = require('express');
const app = express();
const path = require('path');

// ����EJSģ������
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ����·��
app.get('/', (req, res) => {
    res.render('index');
});

// ����������
const port = 3000;
app.listen(port, () => {
    console.log(`������������ http://localhost:${port}`);
});
