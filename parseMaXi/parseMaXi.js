var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var cht2eng = require('../utils/cht2eng');
var date2milliseconds = require('../utils/date2milliseconds');

var MaXiRecords = [];

fs.createReadStream('parseMaXi/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	  
	  let clarificationLastUpdate = "";
	  if(data['澄清說明最後更新時間']){
	  	clarificationLastUpdate = date2milliseconds(data['澄清說明最後更新時間'])
	  }
      let legislator = data['立委名'];
      
      if(legislator==="鄭天財"){
        legislator = "鄭天財Sra·Kacaw";
      }
      
	  var record = {
	  	
	  	date : date2milliseconds(data['發言日期']),
	  	legislator : legislator,
	  	party : cht2eng(data['當時的政黨']),
	  	meeting : data['會議'],
	  	
	  	content : data['發言'],
	  	sourceURL : data['原始來源記錄url （立法院）'],

	  	supportMaXiMeet : cht2eng(data['支持馬習會？']),
	  	positionOnProcedure : cht2eng(data['程序公開透明？']),
	  	
	  	clarificationContent : data['立委澄清說明'],
	  	clarificationLastUpdate : clarificationLastUpdate
	  	
	  	
	  }
	  MaXiRecords.push(record);

	  
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	  
  	  calculatePosition(MaXiRecords);

  	
  });  
function maximumClubReview(countSort, ayePos, nayPos) {
	  let maxCount = countSort[0].count;
    let maximumClub = [];
    countSort.map((value,index)=>{
        if(value.count === maxCount){
            maximumClub.push(value.position);
        }
    })
    
    if(maximumClub.size > 1){
        
        let hasAye = (maximumClub.indexOf(ayePos) !== -1);
        let hasNay = (maximumClub.indexOf(nayPos) !== -1);
        let hasUnknown = (maximumClub.indexOf("unknown") !== -1);

        if(hasAye && !hasNay && hasUnknown){
            return ayePos;
        }
        if(!hasAye && hasNay && hasUnknown){
            return nayPos;
        }
        if(hasAye && hasNay){
            return "unknown";
        }

    }else{//只有一個最高票
    	return countSort[0].position;
    }
	
}
function calculatePosition(records){
	var Legislators = {};
	//把紀錄依照人分
	records.map((record, index)=>{
		var legName = record.legislator;

		if(!Legislators[legName]){
			Legislators[legName] = {};
            Legislators[legName].name = legName;
			Legislators[legName].party = record.party;
			Legislators[legName].records = [];
		}
		Legislators[legName].records.push(record);
	})
	//計算主要立場
	//再計算每個立委的主要立場: 馬習會 & 程序
    Object.keys(Legislators).map((currentLegislator,indx)=>{
        
        let countMaXi = {};
        let countProcedure = {};

        Legislators[currentLegislator].records.map((record,k)=>{
            if(!countMaXi[record.supportMaXiMeet]){
              countMaXi[record.supportMaXiMeet] = 0;
            }
            countMaXi[record.supportMaXiMeet]++;

            if(!countProcedure[record.positionOnProcedure]){
              countProcedure[record.positionOnProcedure] = 0;
            }
            countProcedure[record.positionOnProcedure]++;

        })
      
        /* 計算 dominant position */
        /* 把 count換成 array */
        let countMaXiSort = [];
        Object.keys(countMaXi).map((value, index)=>{
            countMaXiSort.push({
              "position": value, 
              "count": countMaXi[value]
            });
        });

        let countProcedureSort = [];
        Object.keys(countProcedure).map((value, index)=>{
            countProcedureSort.push({
              "position": value, 
              "count": countProcedure[value]
            });
        });
    
        /* sort，票數最高的在前面 */
        countMaXiSort.sort((a,b)=>{
          return b.count-a.count;
        });
        countProcedureSort.sort((a,b)=>{
          return b.count-a.count;
        });

        /* 處理最高表態數相同狀況 */
        /*
            交給 maximumClubReview
            如果有模糊 + 贊成，就算贊成 ，程序是 公開透明 vs. 黑箱
            如果有模糊 + 反對，就算反對
            如果贊成反對同時都有，就算模糊
        */
        
        Legislators[currentLegislator].supportMaXiMeet = maximumClubReview(countMaXiSort, "aye", "nay");
        Legislators[currentLegislator].positionOnProcedure  = maximumClubReview(countProcedureSort, "transparent", "blackbox");
        
        /** 把 records 依照時間排序 */
        Legislators[currentLegislator].records.sort((a,b)=>{
            return b.date-a.date; // 時間新的在前面
        });
    });

    //依照表態次序多寡排序
    let LegislatorsFinal = {};

    let LegislatorsArray = [];
    Object.keys(Legislators).map((legName, index)=>{
      LegislatorsArray.push(Legislators[legName])
    })
    LegislatorsArray.sort((a,b)=>{
      return b.records.length - a.records.length;
    })
    LegislatorsArray.map((v,i)=>{
      LegislatorsFinal[v.name] = v;
    })


    fs.writeFile('./results/MaXiRecords.json', JSON.stringify(LegislatorsFinal, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('MaXiRecords.json is saved.'));
	});
	
}
/*

{
	"姚文智" : {
		supportMaXiMeet : 
		positionOnProcedure : 
		party : 
		records : [
			{
	
			}
		]
	},
	"何欣純" : {
		
	}
}										


*/