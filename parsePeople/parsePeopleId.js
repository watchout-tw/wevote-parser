var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')

const START_ID = 1;
var Name2ID = {};
var currentID = START_ID;


fs.createReadStream('parsePeople/name2id.csv')
  .pipe(csv())
  .on('data', function(data) {
	  //console.log('row', data['議題名稱'])

    var name = data['姓名'];
    if(Name2ID[name]){
      throw "duplicated!"+name
    }
	  Name2ID[name] = currentID;
	  currentID++;
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	
	  fs.writeFile('./results/name2id.json', JSON.stringify(Name2ID, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('name2id.json is saved.'));
	  });
	  
  });  

