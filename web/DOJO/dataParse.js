const fs = require('fs');
const parse = require('csv-parse');
// 读取CSV文件
const inputFile = 'data.csv';
const dataArray = [];
fs.createReadStream(inputFile)
    .pipe(parse.parse({ delimiter: ',' }))
    .on('data', (row) => {
        // 每行数据存储到数组中
        dataArray.push(row);
    })
    .on('end', () => {
        console.log('CSV文件读取完毕');
        console.log(dataArray);
    });