
var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var cht2eng = require('../utils/cht2eng');

var evadingList = {};
fs.createReadStream('parseEvading/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	  //console.log('row', data['議題名稱'])
	  var record = {
	  	issue : data['議題名稱'],
	  	legislator : data['立委名'],
	  	party : cht2eng(data['當時的政黨'])
	  }
	  
	  if(!evadingList[record.legislator]){
	  	  evadingList[record.legislator] = {};
	  }
	  var issueEng = cht2eng(record.issue);

	  evadingList[record.legislator][issueEng] = true;

  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	  
  	  
  	  fs.writeFile('parseEvading/evadingList.json', JSON.stringify(evadingList, null, 4), function (err) {
  			if (err) return console.log(err);
  			console.log(clc.bgGreen('evadingList.json is saved.'));
	  });
  });  
