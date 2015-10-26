
var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')
var cht2eng = require('../utils/cht2eng');

const START_ID = 1;
function yes_to_true(input){
	try{
	    switch(input){
	    	
	    	case '是':
	    		return true;
	    	case '否':
	    		return false;
	    	case '':
	    		return "unknown";
	    	default: 
	    		throw new Error("無法判斷 true/flase =>"+input);
    
	    }
	}catch(e){
		console.log(clc.red(e));
		process.exit(1);
	}
}


var Legislators = {};
var Name2ID = {};
var currentID = START_ID;


fs.createReadStream('parseLegislator/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	  //console.log('row', data['議題名稱'])

	  var representParty1 = {
	  	partyCht : data['代表政黨1'],
	  	startDate : data['到職時間1'],
	  	endDate : data['離職時間1'],
	  }
	  var representParty2 = {
	  	partyCht : data['代表政黨2'],
	  	startDate : data['到職時間2'],
	  	endDate : data['離職時間2'],
	  }
	  var parties = [representParty1];
	  if(representParty2.partyCht){
	  	parties.push(representParty2);
	  }

	  var record = {
	  	id : currentID,
	  	name : data['姓名'],
	  	
	  	parties : parties,

	  	gender : data['性別'],
	  	age : data['年齡'],
	  	isCurrent : yes_to_true(data['是否為第八屆立委']),
	  	constituency1 : data['第八屆選區1'],
	  	constituency2 : data['第八屆選區2'],

	  	isCandidate : yes_to_true(data['是否為第九屆候選人']),
	  	hasResigned : yes_to_true(data['已離職']),
	  	candidateConstituency1 : data['第九屆選區1'],
	  	candidateConstituency2 : data['第九屆選區2']
	  }
	  
	  console.log(record);
	  
	  Legislators[currentID] = record;
	  Name2ID[record.name] = currentID;

	  currentID++;
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	  


  	  fs.writeFile('./results/legislators.json', JSON.stringify(Legislators, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('legislators.json is saved.'));
	  });
	  
	  fs.writeFile('./results/name2id.json', JSON.stringify(Name2ID, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('name2id.json is saved.'));
	  });
	  
  });  

