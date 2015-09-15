
var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')

const START_ID = 1;
const IssueList = ['marriageEquality', 'recall'];

var PartyView = {};

////// Needs refactor /////
/* initialize all issues */
PartyView['marriageEquality'] = {};
PartyView['marriageEquality'].title = "婚姻平權";
PartyView['marriageEquality'].statement = "婚姻不限性別";
PartyView['marriageEquality'].partyPositions = [];
PartyView['recall'] = {};
PartyView['recall'].title = "罷免";
PartyView['recall'].statement = "罷免門檻下修";
PartyView['recall'].partyPositions = [];

var LegislatorView = {};
LegislatorView['marriageEquality'] = {};
LegislatorView['marriageEquality'].title = "婚姻平權";
LegislatorView['marriageEquality'].statement = "婚姻不限性別";
LegislatorView['marriageEquality'].partyPositions = [];
LegislatorView['recall'] = {};
LegislatorView['recall'].title = "罷免";
LegislatorView['recall'].statement = "罷免門檻下修";
LegislatorView['recall'].partyPositions = [];


var PositionView = {};
PositionView['marriageEquality'] = {};
PositionView['marriageEquality'].title = "婚姻平權";
PositionView['marriageEquality'].statement = "婚姻不限性別";
PositionView['marriageEquality'].positions = [];
PositionView['recall'] = {};
PositionView['recall'].title = "罷免";
PositionView['recall'].statement = "罷免門檻下修";
PositionView['recall'].positions = [];

var CandidatePosition = {};
var PartyPosition = {};


function cht_to_eng(cht){
	try{
	switch(cht){
		case '國民黨':
			return 'KMT';
		case '民進黨':
			return 'DPP';
		case '台聯':
			return 'TSU';
		case '親民黨':
			return 'PFP';
		case '民國黨':
			return 'MKT';
		case '無黨籍':
			return 'NONE';
		case '贊成':
	    	return 'aye';
	    case '反對':
	    	return 'nay';
	    case '模糊':
	    	return 'unknown';
	    case '婚姻平權':
	    	return 'marriageEquality';
	    case '罷免':
	    	return 'recall';
		default: 
			throw new Error("Oh-Oh-找不到這個詞的英文捏！<o> "+cht);

	}
	}catch(e){
		console.log(clc.red(e));
		process.exit(1);
	}
}
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
	var Legislators = {};

	/* 把 表態 依照 立委 分組 */

	// 先分出每個立委底下有哪些 record
	records.map((value, index)=>{
		if(!Legislators[value.legislator]){
			Legislators[value.legislator] = {};//empty object for one legislator
			Legislators[value.legislator].name = value.legislator; //'丁守中'
			Legislators[value.legislator].party = value.party; //KTM 
			/***** 目前沒辦法處理一個人在不同政黨有不同立場表態的狀況 ******/
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

	// 再依照主要立場分人，算出最後的結果
	let PositionGroup = {};

	
	PositionGroup["aye"] = [];
	PositionGroup["unknown"] = [];
	PositionGroup["nay"] = [];
	

	Object.keys(Legislators).map((currentLegislator,index)=>{
		let currentPosition = Legislators[currentLegislator].dominantPosition;

		if(!PositionGroup[currentPosition])
			throw new Error("未定義的立場："+currentPosition);

		PositionGroup[currentPosition].push(Legislators[currentLegislator]);
	});

	//console.log(PositionGroup);
	
	/* 最後依照 贊成 - 模糊 - 反對 順序塞到 LegislatorView['marriageEquality'] 底下 */
	
	["aye", "unknown", "nay"].map((currentPosition,index)=>{

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
  		console.log(clc.bgGreen('LegislatorView is saved.'));
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
  		console.log(clc.bgGreen('PositionView is saved.'));
	});
}
function parseToCandidatePosition_Proceed(Legislators, records, currentIssue){
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
    
        //如果最高票是 0 票，那就是沒有表態
        if(countSort[0].count === 0)
        	Legislators[currentLegislator].dominantPosition = "none";

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
		if(!CandidatePosition[currentLegislator]){
			CandidatePosition[currentLegislator] = {};
			CandidatePosition[currentLegislator].name = currentLegislator;
			CandidatePosition[currentLegislator].positions = {};

			IssueList.map((issue, key)=>{
				CandidatePosition[currentLegislator].positions[issue] = {};
			})

		}
		
		CandidatePosition[currentLegislator].positions[currentIssue] = Legislators[currentLegislator];

	});
	

	fs.writeFile('parseIssue/candidatePosition.json', JSON.stringify(CandidatePosition, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('CandidatePosition is saved.'));
	});
}
function parseToCandidatePosition (records, currentIssue) {// records: [], currentIssue: marriageEquality (e.g.)
	var Legislators = {};
	//initialize Legislators
	fs.createReadStream('parseCandidate/data.csv')
 	  .pipe(csv())
      .on('data', function(data) {
	      let name = data['姓名'];
	      Legislators[name] = {}
	      Legislators[name].records = [];
      })
      .on('error', function (err)  { console.error('Error', err);})
      .on('end', function () {
      	  parseToCandidatePosition_Proceed(Legislators, records, currentIssue)

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
			"name":'台灣團結聯盟'}
		,
		{
			"id": "PFP",
			"name":'親民黨'
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
			PartyPosition[currentParty].name = currentParty.name;
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
	  	party : cht_to_eng(data['當時的政黨']),
	  	date : format_date_to_unix_milliseconds(data['發言日期']),// try if we can sort this format?
	  	category : data['分類'], // { 發言, 提案, 表決 }
	  	content : data['內容'],
	  	positionJudgement : data['立場判斷'],
	  	position : cht_to_eng(data['立場統計分類']),
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
  	  		var issue_eng = cht_to_eng(record.issue);

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
			parseToCandidatePosition(PositionRecords_Issue[issue], issue);
			parseToPartyPosition(PositionRecords_Issue[issue], issue);
  	  
  	  });


  	  fs.writeFile('parseIssue/positionRecords.json', JSON.stringify(PositionRecords, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('position.json is saved.'));
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