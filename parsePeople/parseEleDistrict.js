var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')
var cht2eng = require('../utils/cht2eng');


var Districts = {};
var DistrictEng2Cht = {};

fs.createReadStream('parsePeople/districtData.csv')
  .pipe(csv())
  .on('data', function(data) {
	  var cht = data['選區中文'];
	  var eng = data['選區英文簡稱'];
	  Districts[cht] = eng;
	  DistrictEng2Cht[eng] = cht;
	 
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	 
  	  	fs.writeFile('./results/districts.json', JSON.stringify(Districts, null, 4), function (err) {
  			if (err) return console.log(err);
  			console.log(clc.bgGreen('districts.json is saved.'));
	  	});

	  	fs.writeFile('./results/districtEng2Cht.json', JSON.stringify(DistrictEng2Cht, null, 4), function (err) {
  			if (err) return console.log(err);
  			console.log(clc.bgGreen('districtEng2Cht.json is saved.'));
	  	});

  });  

