const fs = require('fs');
const parse = require('csv-parse');
// ��ȡCSV�ļ�
const inputFile = 'data.csv';
const dataArray = [];
fs.createReadStream(inputFile)
    .pipe(parse.parse({ delimiter: ',' }))
    .on('data', (row) => {
        // ÿ�����ݴ洢��������
        dataArray.push(row);
    })
    .on('end', () => {
        console.log('CSV�ļ���ȡ���');
        console.log(dataArray);
    });