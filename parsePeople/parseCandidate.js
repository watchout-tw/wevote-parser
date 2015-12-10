var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')
var cht2eng = require('../utils/cht2eng');

var Name2ID = {};
var District = {};
var Facebook = {};

var Candidates = {};

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
	  		  District= JSON.parse(data);
	  		  if(!District){
	  		  	throw new Error("No districts data.");
	  		  }
  		})
  		.on('error', function (err)  { console.error('Error', err);})
  		.on('end',   function ()     { 
  	  		
          //3. 讀 FB 資料
          loadFB();
          //
	 	});
	  
  });  

function loadFB (argument) {
  fs.createReadStream('parsePeople/candidateFBData.csv')
      .pipe(csv())
      .on('data', function(data) {
          Facebook[data['姓名']] = data['Facebook']; 
      })
      .on('error', function (err)  { console.error('Error', err);})
      .on('end',   function ()     { 
       
        //4. parse 候選人資料
        parseCandidate();    
    
    });
}
function handleParty(partyCht){
  if(partyCht === "無"){
      return "NONE";
  }else{
      return cht2eng(partyCht)
  }
}
function parseCandidate(){
	fs.createReadStream('parsePeople/candidateData.csv')
  		.pipe(csv())
  		.on('data', function(data){

          // load data here
          var record = {};

          //
  				var name = data['姓名'];
  				var id = Name2ID[name];
  				var party = handleParty(data['代表政黨']);

  				var districtArea = District[data['縣市']];
  				var districtNo = data['選區'];

          /* 沒有重要的資訊，跳出警告 */
  				if(!id){
  					  throw new Error("No ID found, name:"+name);
  				}
  				if(!party){
  					  throw new Error("No Party found:"+data['代表政黨']);
  				}
  				if(!districtArea){
  					  throw new Error("No district area english fround:"+data['縣市']);
  				}

          /* 每個人都一定會有的資訊 */
          record.name = name;
          record.id = id;
          record.party = party;
          record.districtArea = districtArea;

          /* 不一定每個人都會有的資訊 */

          //選區又劃分第 1 選區、第 2 選區 ... 等等
  				if(districtNo){ 
  					 record.districtNo = districtNo
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