var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var cht2eng = require('../utils/cht2eng');

var partyOrder = require('../results/partyOrder.json');

var ElectedBlock = [];
fs.createReadStream('parseElectedBlock/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	 
    var partyCht = data['政黨'];
    var partyEng = cht2eng(partyCht);
    var name = data['姓名'];
    
    ElectedBlock.push({
      name: name,
      party: partyEng
    })
   
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
    
	  fs.writeFile('./results/electedBlock.json', JSON.stringify(ElectedBlock, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('electedBlock.json is saved.'));

	  });
	  
  });  

