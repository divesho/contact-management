const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

var vCard = require('vcard');
var card = new vCard();

const server = http.createServer(app);
const port = 8080;

server.listen(port, ()=>{
    console.log(`server listening at ${port}`);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static('public'))

app.get('/', (req, res) => {

    console.log(__dirname + '/index.html');
    return res.sendFile(__dirname + '/index.html');
});

function formatContactData(json) {

  json = json.filter(function(o) {
    return o.TEL ? true : false
  });

  json.sort(function(a, b) {
              
    let key = a.FN > b.FN;
    return key > 0 ? 1 : -1;
  })
  
  let newArr = json.map(o => {

    return {
      id: uuidv4(),
      name: o.FN,
      nName: o.N,
      number: o.TEL ? o.TEL.value : '',
      email: o.EMAIL ? o.EMAIL.value : ''
    }
  });

  return newArr;
}

app.get('/latestContacts', (req, res) => {

  card.readFile("./dest/0001.vcf", function(err, json) {
  
    res.send(formatContactData(json));
  });
});

app.get('/contacts', (req, res) => {
  
  card.readFile("./src/demo.vcf", function(err, json) {

    res.send(formatContactData(json));
  });
});

app.post('/contacts', (req, res) => {

  let str = req.body.value;

  fs.writeFileSync(`./dest/0001.vcf`, str);

  res.send("success");

});