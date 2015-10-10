
var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')

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
function cht_to_eng(cht){
	try{
	switch(cht){
		case '中國國民黨':
			return 'KMT';
		case '民主進步黨':
			return 'DPP';
		case '台聯':
			return 'TSU';
		case '親民黨':
			return 'PFP';
		case '民國黨':
			return 'MKT';
		case '無黨籍':
			return 'NONE';
		
		default: 
			throw new Error("Oh-Oh-找不到這個詞的英文捏！<o> "+cht);

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
	  var record = {
	  	id : currentID,
	  	name : data['姓名'],
	  	party : cht_to_eng(data['政黨']),
	  	partyCht : data['政黨'],
	  	gender : data['性別'],
	  	age : data['年齡'],
	  	isCurrent : yes_to_true(data['是否為第八屆立委']),
	  	constituency1 : data['第八屆選區1'],
	  	constituency2 : data['第八屆選區2'],

	  	isCandidate : yes_to_true(data['是否為第九屆候選人']),
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

