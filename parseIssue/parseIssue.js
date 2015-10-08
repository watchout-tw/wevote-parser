
var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')
var cht2eng = require('../utils/cht2eng');

const START_ID = 1;
const IssueList = ['marriageEquality', 'recall', 'referendum', 'nuclearPower'];
const IssueMeta = [
	{
		"id" : "marriageEquality",
		"title" : "婚姻平權",
		"statement" : "同性婚姻合法化"
    },
    {
		"id" : "recall",
		"title" : "罷免",
		"statement" : "罷免門檻下修"
    },
    {
		"id" : "referendum",
		"title" : "公投",
		"statement" : "公投門檻下修"
    },
    {
		"id" : "nuclearPower",
		"title" : "核四",
		"statement" : "核四停建"
    }
]

/* initialize all issues */

var PartyView = {};
var LegislatorView = {};
var PositionView = {};
IssueMeta.map((issue, index)=>{
	PartyView[issue.id] = {
		title: issue.title,
		statement: issue.statement,
		partyPositions: []
	}
	
	LegislatorView[issue.id] = {
		title: issue.title,
		statement: issue.statement,
		partyPositions: []
	}
	PositionView[issue.id] = {
		title: issue.title,
		statement: issue.statement,
		positions: []
	}
});



var LegislatorPosition = {};
var PartyPosition = {};

function format_date_to_unix_milliseconds(date_string){
	var date = moment(date_string, "YYYY/MM/DD");
	/* 
		input: 2013/11/8
	*/
	let timestamp = date.unix();
	console.log(timestamp);
	
	return timestamp;
	/*
		output: Unix Timestamp (milliseconds)
	*/
}

function parseToPartyView (records, currentIssue) {// records: [], currentIssue: marriage_equality (e.g.)
	var Parties = {};

	/* 把 表態 依照政黨分組 */
	records.map((value, index)=>{
		if(!Parties[value.party])
			Parties[value.party] = [];

		if(!Parties[value.party].records)
			Parties[value.party].records = [];
		

		Parties[value.party].records.push(value);

	});

	/* traverse 每個政黨的記錄，找出最多數，並且記錄「主要立場」跟「百分比」 */
	
	Object.keys(Parties).map((currentParty,index)=>{
		
		//console.log(`xxxxx ${currentParty} xxxxx`);
		let count = {}; count.aye = 0, count.nay = 0, count.unknown = 0;
   	
		Parties[currentParty].records.map((record, k)=>{
			count[record.position]++;
		})

		/** 把 records 依照時間排序 */
		Parties[currentParty].records.sort((a,b)=>{
			return a.date - b.date; // 時間早的在前面
		});
		
		/* 把 count換成 array */
   		let countSort = [];
        Object.keys(count).map((value, index)=>{
            countSort.push(
            {
              "position": value, 
              "count": count[value]
            }
            );
        });
   
        /* sort，票數最高的在前面 */
        countSort.sort((a,b)=>{
          return b.count-a.count;
        });

       
    	/* 計算 percentage */
        let percentage = (countSort[0].count / Parties[currentParty].records.length) * 100;
        percentage  = +percentage.toFixed(2);// + will drop extra zeros

        Parties[currentParty].dominantPosition = countSort[0].position;
        Parties[currentParty].dominantPercentage = percentage;


        //贊成的 percent 數，用來排序
        Parties[currentParty].rank = (count.aye || 0) / Parties[currentParty].records.length;
        Parties[currentParty].party = currentParty;

	});


	// ok! 這裡就是我們要的結果格式
	//console.log(Parties);

	
	/* 最後依「贊成 - 模糊 - 反對」排序 */
	let sortedParty = [];
	Object.keys(Parties).map((currentParty,index)=>{
		sortedParty.push(Parties[currentParty]);
	});
	sortedParty.sort((a, b)=>{
		return b.rank - a.rank;
	});



	// 之後塞到 PartyView['marriageEquality'].partyPositions 底下 */

	sortedParty.map((currentParty,index)=>{

		if(!PartyView[currentIssue].partyPositions)
		 	PartyView[currentIssue].partyPositions = []; // initialize

		PartyView[currentIssue].partyPositions.push(
		{
			"party" : currentParty.party,
    	    "dominantPosition" : currentParty.dominantPosition, // 主要立場
    	    "dominantPercentage" : currentParty.dominantPercentage,
    	    "records" : currentParty.records,
    	    "rank" : currentParty.rank
		});
		
	})



	fs.writeFile('parseIssue/partyView.json', JSON.stringify(PartyView, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('PartyView is saved.'));
	});
}

function parseToLegislatorView (records, currentIssue) {// records: [], currentIssue: marriageEquality (e.g.)
	let evadingLegislators = {};

	fs.createReadStream('evading.csv')
  	  .pipe(csv())
      .on('data', function(data) {
	     
	      let issue = data['議題名稱'];


	      let legislator = data['立委名'];
	      let party = cht2eng(data['當時的政黨']);

	      if(cht2eng(issue) === currentIssue){
	      		evadingLegislators[legislator] = {
	      			name : legislator,
	      			party : party
	      		};
	      }
	     
      })
      .on('error', function (err)  { console.error('Error', err);})
      .on('end',   function ()     { 

          parseToLegislatorView_Proceed (evadingLegislators, records, currentIssue);
        
      });  

	
	
}
function parseToLegislatorView_Proceed (evadingLegislators, records, currentIssue) {// records: [], currentIssue: marriageEquality (e.g.)
	
    // evading_list 記錄了在這個議題上「應表態未表態」的立委名單，array

    let Legislators = {};

	// 分出每個立委底下有哪些 record
	records.map((value, index)=>{
		if(!Legislators[value.legislator]){
			Legislators[value.legislator] = {};//empty object for one legislator
			Legislators[value.legislator].name = value.legislator; //'丁守中'
			Legislators[value.legislator].party = value.party; //KTM 
			/***** 目前沒處理一個人在不同政黨有不同立場表態的狀況 ******/
		}

		if(!Legislators[value.legislator].records)
			Legislators[value.legislator].records = [];
		

		Legislators[value.legislator].records.push(value);

	});
	//console.log(Legislators)


	// 再計算每個立委的主要立場 & 比例
	Object.keys(Legislators).map((currentLegislator,indx)=>{
		
		let count = {}; count.aye = 0, count.nay = 0, count.unknown = 0;
   	
		Legislators[currentLegislator].records.map((record,k)=>{
			count[record.position]++;

		})

		/** 把 records 依照時間排序 */
		Legislators[currentLegislator].records.sort((a,b)=>{
			return a.date - b.date; // 時間早的在前面
		});
		
		/* 把 count換成 array */
   		let countSort = [];
        Object.keys(count).map((value, index)=>{
            countSort.push(
            {
              "position": value, 
              "count": count[value]
            }
            );
        });

        /* sort，票數最高的在前面 */
        countSort.sort((a,b)=>{
          return b.count-a.count;
        });

       
    	/* 計算 percentage */
        let percentage = (countSort[0].count / Legislators[currentLegislator].records.length) * 100;
        percentage  = +percentage.toFixed(2);// + will drop extra zeros

        Legislators[currentLegislator].dominantPosition = countSort[0].position;
        Legislators[currentLegislator].dominantPercentage = percentage;

	});
	//console.log(Legislators)

	// 填寫應表態未表態的立委的 主要立場 & 比例
	Object.keys(evadingLegislators).map((currentLegislator,indx)=>{
		if(Legislators[currentLegislator]){
			throw "<> 應表態未表態的立委，居然有資料？！";
		}
		evadingLegislators[currentLegislator].dominantPosition = "evading";
        evadingLegislators[currentLegislator].dominantPercentage = 100;


	});
		


	// 再依照主要立場分人，算出最後的結果
	let PositionGroup = {};

	PositionGroup["aye"] = [];
	PositionGroup["unknown"] = [];
	PositionGroup["nay"] = [];
	PositionGroup["evading"] = [];
	

    // 把有立場的好寶寶放進去
	Object.keys(Legislators).map((currentLegislator,index)=>{
		let currentPosition = Legislators[currentLegislator].dominantPosition;

		if(!PositionGroup[currentPosition])
			throw new Error("未定義的立場："+currentPosition);

		PositionGroup[currentPosition].push(Legislators[currentLegislator]);
	});

    //把沒立場的壞寶寶放進去
	Object.keys(evadingLegislators).map((currentLegislator,index)=>{
		let currentPosition = evadingLegislators[currentLegislator].dominantPosition;

		if(!PositionGroup[currentPosition])
			throw new Error("未定義的立場："+currentPosition);

		PositionGroup[currentPosition].push(evadingLegislators[currentLegislator]);
	});


	//console.log(PositionGroup);
	
	/* 最後依照 贊成 - 模糊 - 反對 - 應表態未表態 順序塞到 LegislatorView['marriageEquality'] 底下 */
	
	["aye", "unknown", "nay", "evading"].map((currentPosition,index)=>{

	    if(!LegislatorView[currentIssue].positions)
		 	LegislatorView[currentIssue].positions = []; // initialize

		if(PositionGroup[currentPosition].length > 0){
			LegislatorView[currentIssue].positions.push(
			{
				"position" : currentPosition,
    		    "legislators" : PositionGroup[currentPosition]
			});
		}
		
		
	});
	

	console.log(LegislatorView)




	fs.writeFile('parseIssue/legislatorView.json', JSON.stringify(LegislatorView, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('legislatorView is saved.'));
	});
}
function parseToPositionView (records, currentIssue) {// records: [], currentIssue: marriageEquality (e.g.)
	var Positions = {};

	/* 把 表態 依照 立場 分組 */
	//順序固定是 贊成 - 模糊 - 反對
	Positions["aye"] = {};
	Positions["unknown"] = {};
	Positions["nay"] = {};

	Object.keys(Positions).map((key,index)=>{
		Positions[key].position = key;
		Positions[key].records = [];
	})


	records.map((value, index)=>{
		if(!Positions[value.position]){
			throw new Error("未定義的立場："+Positions[value.position]);
		}
		Positions[value.position].records.push(value);

	});


	Object.keys(Positions).map((currentPosition, index)=>{
		PositionView[currentIssue].positions.push(Positions[currentPosition]);
		
	})


	fs.writeFile('parseIssue/positionView.json', JSON.stringify(PositionView, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('positionView is saved.'));
	});
}
function parseToLegislatorPosition_Proceed(Legislators, records, currentIssue, evadingList){
	console.log(Legislators)
	/* 把 表態 依照 立委 分組 */
   
	// 先分出每個立委底下有哪些 record
	records.map((value, index)=>{

		console.log(value.legislator)
		if(!Legislators[value.legislator]){
			Legislators[value.legislator] = {}
			//throw new Error("沒有這個立委的資料："+Legislators[value.legislator]);
		}

		if(!Legislators[value.legislator].records){
			Legislators[value.legislator].records = [];
		}
	
		Legislators[value.legislator].records.push(value);

	});
	//console.log(Legislators)


	// 再計算每個立委的主要立場 & 比例
	Object.keys(Legislators).map((currentLegislator,indx)=>{
		
		let count = {}; count.aye = 0, count.nay = 0, count.unknown = 0;
   	
		Legislators[currentLegislator].records.map((record,k)=>{
			count[record.position]++;

		})
		
		/* 計算 dominant position */
		/* 把 count換成 array */
   	    let countSort = [];
        Object.keys(count).map((value, index)=>{
            countSort.push(
            {
              "position": value, 
              "count": count[value]
            }
            );
        });
    
        /* sort，票數最高的在前面 */
        countSort.sort((a,b)=>{
          return b.count-a.count;
        });
    
        Legislators[currentLegislator].dominantPosition = countSort[0].position;
    
        //如果最高票是 0 票
        if(countSort[0].count === 0){
        	//沒有表態
        	Legislators[currentLegislator].dominantPosition = "none";
        	//應表態未表態
        	if(evadingList[currentLegislator]){
        	    if(evadingList[currentLegislator][currentIssue]){
        	    	if(evadingList[currentLegislator][currentIssue]===true){
        	    		Legislators[currentLegislator].dominantPosition = "evading";
        	    	}
        	    }
            }
        }

		/** 把 records 依照時間排序 */
		Legislators[currentLegislator].records.sort((a,b)=>{
			return a.date - b.date; // 時間早的在前面
		});
		
		Legislators[currentLegislator].positionCounts = [];
		
		Legislators[currentLegislator].positionCounts.push({
			"position" : "nay",
			"count" : count.nay
		})

		Legislators[currentLegislator].positionCounts.push({
			"position" : "unknown",
			"count" : count.unknown
		})
		
		Legislators[currentLegislator].positionCounts.push({
			"position" : "aye",
			"count" : count.aye
		})

		Legislators[currentLegislator].totalCounts = Legislators[currentLegislator].records.length;

	});
	//console.log(Legislators)



	/*******************************************************/
	/* 這裡得到每個立委在這個議題的立場，存到 LegislatorView 裡面 */
	/*******************************************************/
	Object.keys(Legislators).map((currentLegislator,indx)=>{
		if(!LegislatorPosition[currentLegislator]){
			LegislatorPosition[currentLegislator] = {};
			LegislatorPosition[currentLegislator].name = currentLegislator;
			LegislatorPosition[currentLegislator].positions = {};

			IssueList.map((issue, key)=>{
				LegislatorPosition[currentLegislator].positions[issue] = {};
			})

		}
		
		LegislatorPosition[currentLegislator].positions[currentIssue] = Legislators[currentLegislator];

	});
	

	fs.writeFile('parseIssue/legislatorPosition.json', JSON.stringify(LegislatorPosition, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('legislatorPosition is saved.'));
	});
}
function parseToLegislatorPosition (records, currentIssue) {// records: [], currentIssue: marriageEquality (e.g.)
	var Legislators = {};
	var evadingList = {};
	//initialize Legislators
	fs.createReadStream('parseLegislator/data.csv')
 	  .pipe(csv())
      .on('data', function(data) {
	      let name = data['姓名'];
	      Legislators[name] = {}
	      Legislators[name].records = [];
      })
      .on('error', function (err)  { console.error('Error', err);})
      .on('end', function () {
      	 

      	    fs.createReadStream('evading.csv')
  	  	  	  .pipe(csv())
      	  	  .on('data', function(data) {
	       
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
      	          
      	          parseToLegislatorPosition_Proceed(Legislators, records, currentIssue, evadingList)
                  
                
              });  

      })
}
function parseToPartyPosition (records, currentIssue) {// records: [], currentIssue: marriageEquality (e.g.)
	// 先把表態依照政黨分組
	var Parties = {};
	const partyOrders = [
		{	
			"id":"KMT",
		    "name":"中國國民黨"
		},
		{   
			"id":"DPP",
			"name":'民主進步黨'
		},
		{   
			"id": "TSU",
			"name":'台灣團結聯盟'
		}
		,
		{
			"id": "PFP",
			"name":'親民黨'
		},
		{
			"id": "NSU",
			"name":'無黨團結聯盟'
		},
		{
			"id": "NONE",
			"name":'無黨籍'
		}
	];
	partyOrders.map((value, index)=>{
		Parties[value.id] = {};
		Parties[value.id].name = value.name;
		Parties[value.id].records = [];
	})

	// 先分出每個政黨底下有哪些 record
	records.map((value, index)=>{
		if(!Parties[value.party]){
			console.log(`找不到這個政黨：${value.party}`);
		}
		Parties[value.party].records.push(value);
	});
	//console.log(Legislators)


	// 再計算每個政黨的主要立場 & 比例
	Object.keys(Parties).map((currentParty,indx)=>{
		
		let count = {}; count.aye = 0, count.nay = 0, count.unknown = 0;
   	
		Parties[currentParty].records.map((record,k)=>{
			count[record.position]++;

		})
		
		/* 計算 dominant position */
		/* 把 count換成 array */
   	    let countSort = [];
        Object.keys(count).map((value, index)=>{
            countSort.push(
            {
              "position": value, 
              "count": count[value]
            }
            );
        });
    
        /* sort，票數最高的在前面 */
        countSort.sort((a,b)=>{
          return b.count-a.count;
        });
    
        Parties[currentParty].dominantPosition = countSort[0].position;
    
        //如果最高票是 0 票，那就是沒有表態
        if(countSort[0].count === 0)
        	Parties[currentParty].dominantPosition = "none";

		/** 把 records 依照時間排序 */
		Parties[currentParty].records.sort((a,b)=>{
			return a.date - b.date; // 時間早的在前面
		});
		
		Parties[currentParty].positionCounts = [];
		
		Parties[currentParty].positionCounts.push({
			"position" : "nay",
			"count" : count.nay
		})

		Parties[currentParty].positionCounts.push({
			"position" : "unknown",
			"count" : count.unknown
		})
		
		Parties[currentParty].positionCounts.push({
			"position" : "aye",
			"count" : count.aye
		})

		Parties[currentParty].totalCounts = Parties[currentParty].records.length;

	});
	//console.log(Legislators)



	/*******************************************************/
	/* 這裡得到每個政黨在這個議題的立場，存到 PartyPosition 裡面 */
	/*******************************************************/
	Object.keys(Parties).map((currentParty,indx)=>{
		if(!PartyPosition[currentParty]){
			PartyPosition[currentParty] = {};
			PartyPosition[currentParty].name = Parties[currentParty].name;
			PartyPosition[currentParty].positions = {};

			//初始化每個政黨，在每個議題的資料
			IssueList.map((issue, key)=>{
				PartyPosition[currentParty].positions[issue] = {};
			})

		}
		
		PartyPosition[currentParty].positions[currentIssue] = Parties[currentParty];

	});
	

	fs.writeFile('parseIssue/partyPosition.json', JSON.stringify(PartyPosition, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('PartyPosition is saved.'));
	});
}

var PositionRecords = [];
var currentID = START_ID;

fs.createReadStream('parseIssue/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	  //console.log('row', data['議題名稱'])
	  var record = {
	  	id : currentID,
	  	issue : data['議題名稱'],
	  	legislator : data['立委名'],
	  	party : cht2eng(data['當時的政黨']),
	  	date : format_date_to_unix_milliseconds(data['發言日期']),// try if we can sort this format?
	  	category : data['分類'], // { 發言, 提案, 表決 }
	  	content : data['內容'],
	  	positionJudgement : data['立場判斷'],
	  	position : cht2eng(data['立場統計分類']),
	  	clarificationContent : data['立委澄清說明'],
	  	clarificationLastUpdate : data['澄清說明最後更新時間'],
	  	lyURL : data['原始來源記錄url （立法院）'],
	  	meeting : data['會議別'],
	  	meetingCategory : data['會議分類']
	  }
	  //console.log(record);
	  PositionRecords.push(record);

	  currentID++;
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	  
  	  
  	  /* 依照不同議題分類，然後把每個議題的資料丟進去 */
  	  let PositionRecords_Issue = {};

  	  PositionRecords.map((record, index)=>{
  	  		var issue_eng = cht2eng(record.issue);

  	  		if(!PositionRecords_Issue[issue_eng]){
  	  			PositionRecords_Issue[issue_eng] = []; 
  	  		}
  	  		PositionRecords_Issue[issue_eng].push(record); 
  	  })
  	 
  	  Object.keys(PositionRecords_Issue).map((issue, index)=>{

  	  		/* 丟到 parseToPartyView parse 成要的格式 */
			parseToPartyView(PositionRecords_Issue[issue], issue);
			parseToLegislatorView(PositionRecords_Issue[issue], issue);
			parseToPositionView(PositionRecords_Issue[issue], issue);

			//
			parseToLegislatorPosition(PositionRecords_Issue[issue], issue);
			parseToPartyPosition(PositionRecords_Issue[issue], issue);
  	  
  	  });

  	  //每一筆記錄用 object 的方式記錄
  	  let Records = {};
  	  PositionRecords.map((value,index)=>{
  	  		Records[value.id] = value;
  	  });

  	  fs.writeFile('parseIssue/records.json', JSON.stringify(Records, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('records.json is saved.'));
	  });
  });  

/*

議題名稱	 立委名 當時的政黨 發言日期 分類 內容
立場判斷 立場統計分類
立委澄清說明
澄清說明最後更新時間
原始來源記錄url （立法院）
會議別
會議分類											

*/