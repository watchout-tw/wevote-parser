var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var cht2eng = require('../utils/cht2eng');

var PartyOrder = [];
fs.createReadStream('parsePartyOrder/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	 
    var partyCht = data['政黨'];
    var partyEng = cht2eng(partyCht);
    
    PartyOrder.push(partyEng);
   
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	
	  fs.writeFile('./results/partyOrder.json', JSON.stringify(PartyOrder), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('partyOrder.json is saved.'));

	  });
	  
  });  

