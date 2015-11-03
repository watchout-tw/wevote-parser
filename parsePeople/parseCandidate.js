var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')
var cht2eng = require('../utils/cht2eng');

var Name2ID = {};
var District = {};

var Candidates = {};

fs.createReadStream('results/name2id.json')
  .on('data', function(data) {
	  //先讀 id 資料進來
	  Name2ID = JSON.parse(data);
	  if(!Name2ID){
	  	throw new Error("No Name2ID data.");
	  }
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	  
  	  //讀選區中英文對照表進來
  	  fs.createReadStream('results/districts.json')
  		.on('data', function(data) {
	  		//先讀 id 資料進來
	  		District= JSON.parse(data);
	  		if(!District){
	  			throw new Error("No districts data.");
	  		}
  		})
  		.on('error', function (err)  { console.error('Error', err);})
  		.on('end',   function ()     { 
  	  		parseCandidate();
	 	});
	  
  });  

function parseCandidate(){
	fs.createReadStream('parsePeople/candidateData.csv')
  		.pipe(csv())
  		.on('data', function(data) {

  				var name = data['姓名'];
  				var id = Name2ID[name];
  				var party = cht2eng(data['代表政黨']);

  				var districtArea = District[data['縣市']];
  				var districtNo = data['選區'];
  				if(!id){
  					throw new Error("No ID found, name:"+name);
  				}
  				if(!party){
  					throw new Error("No Party found:"+data['代表政黨']);
  				}
  				if(!districtArea){
  					throw new Error("No district area english fround:"+data['縣市']);
  				}

  				if(districtNo){
  					var record = {
	  					name : data['姓名'],
	  					id: id,
	  					party: party,
	  					districtArea: districtArea,
	  					districtNo: districtNo
	  				}

  				}else{
  					var record = {
	  					name : data['姓名'],
	  					id: id,
	  					party: party,
	  					districtArea: districtArea
	  				}
  				}
	  			
	  			
	  			//console.log(record);
	  			
	  			Candidates[id] = record;
	  	})
	  	.on('error', function (err)  { console.error('Error', err);})
 		.on('end',   function ()     { 
 			 
 			  fs.writeFile('./results/candidates.json', JSON.stringify(Candidates, null, 4), function (err) {
 				if (err) return console.log(err);
 				console.log(clc.bgGreen('candidates.json is saved.'));
	  		});
	  
 		});  
}