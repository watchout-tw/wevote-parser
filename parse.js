console.log("hooooo")
var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var moment = require('moment')
/*

議題名稱	
立委名
當時的政黨
發言日期
分類
內容
立場判斷
立場統計分類
立委澄清說明
澄清說明最後更新時間
原始來源記錄url （立法院）
會議別
會議分類											

*/
function party_cht_to_eng(party_cht){
	try{
	switch(party_cht){
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
		default: 
			throw new Error("Oh-Oh-找不到這個政黨的英文簡稱！<o> "+party_cht);

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
	
	return moment.milliseconds();
	/*
		output: Unix Timestamp (milliseconds)
	*/
}
var PositionRecords = [];
fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', function(data) {
	  //console.log('row', data['議題名稱'])
	  var record = {
	  	Issue : data['議題名稱'],
	  	Legislator : data['立委名'],
	  	Party : party_cht_to_eng(data['當時的政黨']),
	  	Date : data['發言日期']// try if we can sort this format?
	  }
	  console.log(record);


  })