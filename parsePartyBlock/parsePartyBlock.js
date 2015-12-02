var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var cht2eng = require('../utils/cht2eng');

var partyOrder = require('../results/partyOrder.json');

var PartyBlock = {};
fs.createReadStream('parsePartyBlock/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	 
    var partyCht = data['政黨'];
    var partyEng = cht2eng(partyCht);
    var name = data['姓名'];
    var tag = data['Tag'];
    if(!PartyBlock[partyEng]){
      PartyBlock[partyEng] = {};
      PartyBlock[partyEng].title = partyCht;
      PartyBlock[partyEng].id = partyEng;
      PartyBlock[partyEng].list = [];
    }
    PartyBlock[partyEng].list.push({
      name: name,
      info: tag
    })
   
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
    //最後的結果依照順序
    var OrderedParty = {};
    partyOrder.map((partyId, i)=>{
      OrderedParty[partyId] = PartyBlock[partyId];
    })
  	
	  fs.writeFile('./results/partyBlock.json', JSON.stringify(OrderedParty, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('partyBlock.json is saved.'));

	  });
	  
  });  

