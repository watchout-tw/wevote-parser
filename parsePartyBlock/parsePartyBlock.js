var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var cht2eng = require('../utils/cht2eng');

var PartyBlock = {};
fs.createReadStream('parsePartyBlock/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	 
    var partyCht = data['政黨'];
    var partyEng = cht2eng(partyCht);
    var name = data['姓名'];
    if(!PartyBlock[partyEng]){
      PartyBlock[partyEng] = {};
      PartyBlock[partyEng].title = partyCht;
      PartyBlock[partyEng].id = partyEng;
      PartyBlock[partyEng].list = [];
    }
    PartyBlock[partyEng].list.push(name)
   
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	
	  fs.writeFile('./results/partyBlock.json', JSON.stringify(PartyBlock, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('partyBlock.json is saved.'));

	  });
	  
  });  

