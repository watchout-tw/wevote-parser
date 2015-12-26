var fs = require('fs'),
    csv = require('csv-parser'),
    clc = require('cli-color'),
    moment = require('moment'),
    cht2eng = require('../utils/cht2eng'),
    handlePromisePosition = require('../utils/handlePromisePosition');

var Name2ID = {};
var District = {};
var NoContacts = {};
var Numbers = {};
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
  	  		
          //3. 讀聯絡資料
          loadContact();
	 	});
	  
  });  

function loadContact (argument) {
  fs.createReadStream('parsePeople/candidateContactData.csv')
      .pipe(csv())
      .on('data', function(data) {
          var name = data['姓名'];
          var id = Name2ID[name];
          if(data['無聯繫方式']){
              NoContacts[id] = true;
          }
      })
      .on('error', function (err)  { console.error('Error', err);})
      .on('end',   function ()     { 
        //4. parse 競選編號跟生日
        loadNumber();    
    
    });
}
function loadNumber(){
  fs.createReadStream('parsePeople/candidateNumberData.csv')
      .pipe(csv())
      .on('data', function(data) {
          var name = data['姓名'];
          var id = Name2ID[name];
          Numbers[id] = Number(data['抽籤號次']);
      })
      .on('error', function (err)  { console.error('Error', err);})
      .on('end',   function ()     { 
        //5. parse 候選人資料
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

  				var districtArea = District[data['縣市'].replace('台','臺')];
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
          record.id = id;//可以考慮不放
          record.name = name;//可以考慮不放
          record.number = Numbers[id];//競選編號
          
          record.party = party;
          record.districtArea = districtArea;

          /* 不一定每個人都會有的資訊 */

          //選區又劃分第 1 選區、第 2 選區 ... 等等
  				if(districtNo){ 
  					 record.districtNo = districtNo
  				}else{
             record.districtNo = 'N/A';
          }

          var hasReply = (data['婚姻平權-立場'] || data['罷免-立場'] || data['公投-立場'] || data['核能-立場'] || data['課綱-立場'] || data['司法改革-立場']) ? true : false;
          
          var contactAvaliable = true;
          if(NoContacts[id]){
              contactAvaliable = false;
          }

          record.contactAvaliable = contactAvaliable;

          var positions = {
            marriageEquality : {
                promise : {
                   position : handlePromisePosition(data['婚姻平權-立場']),
                   statement : data['婚姻平權-補充意見']
                }
            },
            recall : {
                promise : {
                   position : handlePromisePosition(data['罷免-立場']),
                   statement : data['罷免-補充意見']
                }
            },
            referendum : {
                promise : {
                   position : handlePromisePosition(data['公投-立場']),
                   statement : data['公投-補充意見']
                }
            },
            nuclearPower : {
                promise : {
                   position : handlePromisePosition(data['核能-立場']),
                   statement : data['核能-補充意見']
                }
            },
            courseGuide : {
                promise : {
                   position : handlePromisePosition(data['課綱-立場']),
                   statement : data['課綱-補充意見']
                }
            },
            justiceReform : {
                promise : {
                   position : handlePromisePosition(data['司法改革-立場']),
                   statement : data['司法改革-補充意見']
                }
            }
        };
        var bills = [
            {
              goal: data['法案1-目標'],
              content: data['法案1-內容']
            },
            {
              goal: data['法案2-目標'],
              content: data['法案2-內容']
            },
            {
              goal: data['法案3-目標'],
              content: data['法案3-內容']
            }
        ];
  	
	  		record.hasReply = hasReply;
        record.positions = positions;
        record.bills = bills;

        //push
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