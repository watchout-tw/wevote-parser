
var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')

const START_ID = 1;


var Candidates = {};
var Name2ID = {};
var currentID = START_ID;

fs.createReadStream('parseCandidate/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	  //console.log('row', data['議題名稱'])
	  var record = {
	  	id : currentID,
	  	name : data['姓名'],
	  	education : data['學歷']
	  }
	  
	  console.log(record);
	  
	  Candidates[currentID] = record;
	  Name2ID[record.name] = currentID;

	  currentID++;
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	  


  	  fs.writeFile('parseCandidate/candidates.json', JSON.stringify(Candidates, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('candidates.json is saved.'));
	  });
	  
	  fs.writeFile('parseCandidate/name2id.json', JSON.stringify(Name2ID, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('name2id.json is saved.'));
	  });
	  
  });  

