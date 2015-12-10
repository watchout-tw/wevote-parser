
var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')
var cht2eng = require('../utils/cht2eng');

var Name2ID = {};
var District = {};
var Legislators = {};

fs.createReadStream('results/name2id.json')
  .on('data', function(data) {
	  //1. 讀 id 資料進來
	  Name2ID = JSON.parse(data);
	  if(!Name2ID){
	  	throw new Error("No Name2ID data.");
	  }
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	  
  	  //2. 讀選區中英文對照表進來
  	  fs.createReadStream('results/districts.json')
  		.on('data', function(data) {
	  		  District = JSON.parse(data);
	  		  if(!District){
	  		  	throw new Error("No districts data.");
	  		  }
  		})
  		.on('error', function (err)  { console.error('Error', err);})
  		.on('end',   function ()     { 
  	  		
          //3. parseLegislator
          parseLegislator();
          //
	 	});
	  
  }); 

function parseLegislator (argument) {
	fs.createReadStream('parsePeople/legislatorData.csv')
	  .pipe(csv())
	  .on('data', function(data) {
		  
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
	
		  var name = data['姓名'];
		  var id = Name2ID[name];
	  	  var constituency1 = District[data['第八屆選區1']];
	  	  var constituency2 = data['第八屆選區2'];
	
		  var record = {
		  	id : id,
		  	name : name,
		  	parties : parties,
		  	constituency1 : constituency1,
		  	constituency2 : constituency2,
		  	hasResigned : yes_to_true(data['已離職'])
		  }
		  
		  Legislators[id] = record;
	
	  })
	  .on('error', function (err)  { console.error('Error', err);})
	  .on('end',   function ()     { 
	  	 
	  	  fs.writeFile('./results/legislators.json', JSON.stringify(Legislators, null, 4), function (err) {
	  		if (err) return console.log(err);
	  		console.log(clc.bgGreen('legislators.json is saved.'));
		  });

	  });  
}
function yes_to_true(input){
	if(!input) return "";
	
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
