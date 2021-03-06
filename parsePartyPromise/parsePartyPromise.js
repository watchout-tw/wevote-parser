var fs = require('fs'),
    csv = require('csv-parser'),
    clc = require('cli-color'),
    cht2eng = require('../utils/cht2eng'),
    handlePromisePosition = require('../utils/handlePromisePosition');

var partyOrder = require('../results/partyOrder.json');

var Party = {}


fs.createReadStream('parsePartyPromise/partyData.csv')
  .pipe(csv())
  .on('data', function(data) {
	  //console.log('row', data['議題名稱'])

      var name = data['政黨'];
      var partyEng = cht2eng(name);
      var hasReply = (data['婚姻平權-立場'] || data['罷免-立場'] || data['公投-立場'] || data['核能-立場'] || data['課綱-立場'] || data['司法改革-立場'] ) ? true : false;

      Party[partyEng] = {
        name : name,
        id: partyEng,
        number: data['編號'],
        hasReply: hasReply,
        positions : {
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
        },
        bills : [
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
        ]
      }

	 
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	//最後的結果依照順序
    var OrderedParty = {};
    partyOrder.map((partyId, i)=>{
      OrderedParty[partyId] = Party[partyId];
    })
	  fs.writeFile('./results/partyPromises.json', JSON.stringify(OrderedParty, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('partyPromises.json is saved.'));
	  });
	  
  });  

// output format
// 把 issue 用 id 改成了用 name - camelcase
/*
data = {
  "KMT": 
    "title" : "中國國民黨",
    "id" : "KMT",
    "positions" :
      {
        "marriageEquality": {
            "record" : { "position": "none" },
            "promise" : { 
              "position": "aye",
              "statement": "我理解到人權的重要，未來將以行動支持同性婚姻合法化。"
            }
      },
*/
