//程序入口：命令行输入node app.js
const starknet = require('starknet');
const starknetkit = require('starknetkit');
const express = require('express');
const app = express();
const port = 3000;
const dataArray = [];
const fs = require('fs');
const parse = require('csv-parse');
// 读取题库CSV文件
const inputFile = 'data.csv';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

let currentQuestion = 0;
let currentQuestionId = 0;
let score = 0;
let isInGame = 0;

dataParse();
//连接合约
const provider = new starknet.RpcProvider({ nodeUrl: "https://starknet-testnet.public.blastapi.io" });
console.log("Provider connected to RPC");
const myPrivateKey = "0x03e9be7873a4e116cbe018af397e8ae336e587f0b6eefccb1370a2aa9e46816b";
const myWalltAddress = "0x065C7954aC551d3bca096B78d6a8575d37F59661dd3b74f37A57be85461C7c93";
const account0 = new starknet.Account(provider, myWalltAddress, myPrivateKey);

const testAddress = "0x01e3f27a76abc1e41742fa163579108d1454d606cb3fb5bff8306b912298677c";
const compiledTest = starknet.json.parse(fs.readFileSync("contracts_Game.contract_class.json").toString("ascii"));
const myTestContract = new starknet.Contract(compiledTest.abi, testAddress, provider);
console.log('? Test Contract connected at =', myTestContract.address);
//页面显示
app.use(express.static("public"));
app.get('/', (req, res) => {
    if (isInGame==0) {
        res.render('index');
    }
    else if (currentQuestion < 27) {
        currentQuestionId = getRandomId();
        res.render('game', { question: dataArray[currentQuestionId][0], options: [dataArray[currentQuestionId][1], dataArray[currentQuestionId][2], dataArray[currentQuestionId][3]] });
    } else {
        res.render('result', { score: score });
    }
});

app.post('/submit', (req, res) => {
    const selectedOption = req.body.option;
    if (selectedOption === dataArray[currentQuestionId][4]) {
        score++;
    }
    currentQuestion++;
    res.redirect('/');
});
app.post('/connect', (req, res) => {
    const walletAddress = req.body.name;
   /* startGame();
    const start = checkGameState();
    if (start == true) {
        isInGame = 1;
        res.redirect('/');
    }*/
    isInGame = 1;
    res.redirect('/');
});
app.post('/quit', (req, res) => {
    currentQuestion = 0;
    score = 0;
    isInGame = 0;
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
//解析数据表格
function dataParse() {
    fs.createReadStream(inputFile)
        .pipe(parse.parse({ delimiter: ',' }))
        .on('data', (row) => {
            // 每行数据存储到数组中
            dataArray.push(row);
        })
        
}
function getRandomId() {
    return Math.floor(Math.random() * (dataArray.length  + 1));
}
async function startGame() {
    //myTestContract.connect(account0);
    const connection = await starknetkit.connect();
    if (connection && connection.isConnected) {
        setConnection(connection)
        setProvider(connection.account)
        setAddress(connection.selectedAddress)
    }
}

async function checkGameState() {
    return await myTestContract.is_in_game();
}
//交互案例
async function interactWithContract() {

    const res = await myTestContract.is_in_game();
    console.log('? Test Is In Game =', res);
    const adv = await myTestContract.get_current_adventure();
    console.log('? Test Get Current Adventure =', adv._genesis_timestamp);
}
/*interactWithContract()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
*/