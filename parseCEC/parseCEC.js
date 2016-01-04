var fs = require('fs'),
    csv = require('csv-parser'),
    clc = require('cli-color'),
    moment = require('moment'),
    cht2eng = require('../utils/cht2eng'),
    handlePromisePosition = require('../utils/handlePromisePosition');

var request = require('request');

var CurrentTime;
var Name2ID = {},
    Type3 = {},
    Type4 = {},
    Type5 = {},
    CEC = {};

/* ----- main ----- */
readID().then(()=>{
  console.log("id")
  readDistrictData().then(()=>{
    readMABData().then(()=>{
      readLABData().then(()=>{
           parseCEC();
      })
    })
  })
})
function trimEng(input){
  var finalText = input;
  
  const pattern=/([A-Z]+)([a-z]+)/;
  var engIndex = input.search(pattern);

  if(engIndex !== -1){
    finalText = input.substring(0,engIndex);
  }


  finalText = finalText.replace(/·+/g,"");//沃草：馬躍·比吼
  finalText = finalText.replace(/‧+/g,"");//中選會：馬躍‧比吼^Mayaw‧Biho
  finalText = finalText.replace("^","");//中選會：鄭天財^Sra‧Kacaw
  finalText = finalText.replace("黄","黃");//中選會：黄
  finalText = finalText.replace("．","");//中選會
 

  return finalText;

}
function parseCEC(){
  console.log(CurrentTime.format("YYYY/MM/DD HH:mm"))//2016/01/04 12:32
  CEC.updateTime = CurrentTime.format("YYYY/MM/DD HH:mm");
  CEC.data = {};

  //把 id 對照表直接英文跟·拿掉，再來找 id
  var CHT_Name2Id = {};
  Object.keys(Name2ID).map((peopleName, i)=>{
      let trimName = trimEng(peopleName);
      // console.log(peopleName)
      // console.log("-> " + trimName)
      CHT_Name2Id[trimName] = Name2ID[peopleName];
  });
  


  //讀入中選會資料
  Type3['區域立委公報'].map((entry, i)=>{
   
    let name = trimEng(entry.candidatename);
    let id = CHT_Name2Id[name];
    
    console.log(name+":"+id);

    if(!id){
      throw new Error("No CHT_Name2Id data:"+name);
    }
    CEC.data[id] = entry;

  })
  Type4['山地原住民立委'].map((entry, i)=>{
    
    let name = trimEng(entry.candidatename);
    let id = CHT_Name2Id[name];

    console.log(name+":"+id);

    if(!id){
      throw new Error("No CHT_Name2Id data:"+name);
    }
    CEC.data[id] = entry;

  })
  Type5['平地原住民立委'].map((entry, i)=>{
    let name = trimEng(entry.candidatename);
    let id = CHT_Name2Id[name];

    console.log(name+":"+id);

    if(!id){
      throw new Error("No CHT_Name2Id data:"+name);
    }
    CEC.data[id] = entry;

  })



  fs.writeFile('./results/CEC.json', JSON.stringify(CEC, null, 4), function (err) {
     if (err) return console.log(err);
     console.log(clc.bgGreen('CEC.json is saved.'));
  });

}
  
function readID(){
  return new Promise((resolve, reject)=>{
      fs.createReadStream('results/name2id.json')
        .on('data', function(data) {
          Name2ID = JSON.parse(data);
          if(!Name2ID){
            throw new Error("No Name2ID data.");
          }
        })
        .on('error', function (err)  { console.error('Error', err);})
        .on('end',   function ()     { 
            CurrentTime = new moment();
            resolve(Name2ID);
        });
  });
}
function readDistrictData(){
//區域立委參選人資料
  let url = 'http://2016.cec.gov.tw/opendata/cec2016/getJson?dataType=3';
  return new Promise((resolve, reject)=>{
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          Type3 = JSON.parse(body);
        }
        resolve(Type3);
    })

  });
}
function readMABData(){
//山地原住民
  let url = 'http://2016.cec.gov.tw/opendata/cec2016/getJson?dataType=4';
  return new Promise((resolve, reject)=>{
      request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            Type4 = JSON.parse(body);
          }
          resolve(Type4);
      })
  });
}
function readLABData(){
//平地原住民
  let url = 'http://2016.cec.gov.tw/opendata/cec2016/getJson?dataType=5';
  return new Promise((resolve, reject)=>{
      request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            Type5 = JSON.parse(body);
          }
          resolve(Type5);
      })
  });
}
