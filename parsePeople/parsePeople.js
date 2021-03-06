var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')
var cht2eng = require('../utils/cht2eng');

var Name2ID = {};
var District = {};
var Facebook = {};
var Candidates = {};
var Legislator = {};
var People = {};

/* main */
loadID().then((I)=>{
	  loadLegislator().then((L)=>{
	  		console.log("load legislator")
	  		loadCandidates().then((C)=>{
	  			  console.log("load candidate")
	  			  Combine();
	  		})
	  })
	
})

function Combine () {
	var nameArray = Object.keys(Name2ID);

	nameArray.map((name,i)=>{
		var record = {};
		var id = Name2ID[name];
		if(!id){
  			throw new Error("No ID found, name:"+name);
  		}
  		record.name = name;
  		record.id = id;



  		if(Candidates[id]){
  			if(Candidates[id].age){
  				record.age = Candidates[id].age;
  			}
  		}
  		if(Legislator[id] &&!record.age){//候選人資料精確到月，以候選人資料為主要來源
  			if(Legislator[id].age){
  				record.age = Legislator[id].age;
  			}
  		}
  		console.log(record);
	  	People[id] = record;
	
	})
	fs.writeFile('./results/people.json', JSON.stringify(People, null, 4), function (err) {
 		if (err) return console.log(err);
 		console.log(clc.bgGreen('people.json is saved.'));
	});

}

function loadID () {
	return new Promise(function(resolve, reject) {
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

				resolve(Name2ID);
	  		});  
	});
}

function loadLegislator(){
	return new Promise(function(resolve, reject) {
		fs.createReadStream('parsePeople/legislatorData.csv')
  			.pipe(csv())
  			.on('data', function(data){
  				// load data here
        	  	var record = {};

        	  	var age;
        	  	if(Number(data['出生西元年'])){ 
        	  	    age = 2016 - Number(data['出生西元年']); 
        	  	}
        	  	/* 沒有重要的資訊，跳出警告 */
  				    var name = data['姓名'];
  				    var id = Name2ID[name];
        	     	if(!id){
  				    	throw new Error("No ID found, name:"+name);
  				    }
	
        	  	/* 每個人都一定會有的資訊 */
        	  	record.name = name;
        	  	record.id = id;
	
        	  	//年齡
        	  	if(age){
        	  	   record.age = age;
        	  	}
        	  		
	  			//console.log(record);
	  			Legislator[id] = record;
	
	  		})
	  		.on('error', function (err)  { console.error('Error', err);})
 			.on('end',   function ()     { 
 				 
 				resolve(Legislator);
	  	
 			});  
 	});
}
function loadCandidates(){
	return new Promise(function(resolve, reject) {
		fs.createReadStream('parsePeople/candidateData.csv')
  			.pipe(csv())
  			.on('data', function(data){
	
        	  	// load data here
        	  	var record = {};
		
        	  	//
  				    var name = data['姓名'];
  				    var id = Name2ID[name];
        	  	
        	  	/* 沒有重要的資訊，跳出警告 */
  				    if(!id){
  				    	throw new Error("No ID found, name:"+name);
  				    }
	
        	  	/* 每個人都一定會有的資訊 */
        	  	record.name = name;
        	  	record.id = id;
	
	  			    //console.log(record);
	  			    Candidates[id] = record;
	
	  		})
	  		.on('error', function (err)  { console.error('Error', err);})
 			  .on('end',   function ()     { 
 				     
            fs.createReadStream('parsePeople/candidateNumberData.csv')
              .pipe(csv())
              .on('data', function(data) {
                var name = data['姓名'];
                var id = Name2ID[name];
                let age = 2016-(1911+Number(data['民國年']));
                let Month = Number(data['月日'].split('/')[0]);
                let Day = Number(data['月日'].split('/')[1]);
                if((Month > 1) || (Month === 1 && Day > 17)){
                  age -= 1;
                }
                Candidates[id].age = age;
              })
              .on('error', function (err)  { console.error('Error', err);})
              .on('end',   function ()     { 
                 resolve(Candidates);  
              });
 			  });  
 	});
}

/* helper */
function handleParty(partyCht){
  if(partyCht === "無"){
      return "NONE";
  }else{
      return cht2eng(partyCht)
  }
}
