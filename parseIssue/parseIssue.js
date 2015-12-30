
var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')
var cht2eng = require('../utils/cht2eng');

const START_ID = 1;

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

var PositionRecords = [];
var currentID = START_ID;

fs.createReadStream('parseIssue/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	  //console.log('row', data['議題名稱'])

	  let clarificationLastUpdate = "";
	  if(data['澄清說明最後更新時間']){
	  	clarificationLastUpdate = format_date_to_unix_milliseconds(data['澄清說明最後更新時間'])
	  }

	  //因為改了議題中文短稱
	  let issueTitle = data['議題名稱'];
	  if(issueTitle === "核能"){
	  	 issueTitle = "核四停建"
	  }
	  if(issueTitle === "課綱"){
	  	 issueTitle = "課綱程序透明"
	  }

	  var record = {
	  	id : currentID,
	  	issue : issueTitle,
	  	legislator : data['立委名'].trim(),
	  	party : cht2eng(data['當時的政黨']),
	  	date : format_date_to_unix_milliseconds(data['發言日期']),// try if we can sort this format?
	  	category : data['分類'], // { 發言, 提案, 表決 }
	  	content : data['內容'],
	  	positionJudgement : data['立場判斷'],
	  	position : cht2eng(data['立場統計分類']),
	  	clarificationContent : data['立委澄清說明'],
	  	clarificationLastUpdate : clarificationLastUpdate,
	  	lyURL : data['原始來源記錄url （立法院）'],
	  	otherSourceTitle : data['其他來源名稱'],
	  	otherSourceURL: data['來源url'],
	  	meeting : data['會議別'],
	  	meetingCategory : data['會議分類']
	  }
	  //console.log(record);
	  PositionRecords.push(record);

	  currentID++;
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	  
  	  //每一筆記錄用 object 的方式記錄
  	  let Records = {};
  	  PositionRecords.map((value,index)=>{
  	  		Records[value.id] = value;
  	  });

  	  fs.writeFile('./results/records.json', JSON.stringify(Records, null, 4), function (err) {
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