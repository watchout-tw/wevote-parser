var q = require('q'),
    http = require('http'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    async = require('async'),
    $ = require('jquery'),
    clc = require('cli-color');

var MusouArticles = {};
const articleList = [
  {
      name : "馬躍・比吼：十年後，我們還要夜宿凱道嗎？",
      link : "http://musou.tw/focuses/1082"
  }
];
/*
[ 
 {
      name : "搖滾魂對抗舊威權 林昶佐有機會帶新政治進國會？",
      link : "http://musou.tw/focuses/1081"
  },
  {
      name : "「曾欣賞馬英九」楊實秋：如今我引以為戒",
      link : "http://musou.tw/focuses/1078"
  },
  {
      name : "從殯儀館到廟口－邱顯智參選初體驗",
      link : "http://musou.tw/focuses/998"
  },
  {
      name : "苗博雅：我進立法院也不會馬上提出廢死",
      link : "http://musou.tw/focuses/999"
  },
  {
      name : "李慶元：國民黨提名就當選是不對的",
      link : "http://musou.tw/focuses/1001"
  },
  {
      name : "無法漠視不合理 黃國昌：我是「放不下」的人（上）",
      link : "http://musou.tw/focuses/1008"
  },
  {
      name : "無法漠視不合理 黃國昌：我是「放不下」的人（下）",
      link : "http://musou.tw/focuses/1010"
  },
  {
      name : "「政治不是搞好人好事代表」 柯建銘：我最瞭解王金平的痛苦",
      link : "http://musou.tw/focuses/1018"
  },
  {
      name : "病人哭，不是抗憂鬱劑就能解決——精神科醫師潘建志的「三顆藥」能讓台灣幸福？",
      link : "http://musou.tw/focuses/1023"
  },
  {
      name : "遺傳老爸全力以赴 李晏榕：立委就是要有GUTS！",
      link : "http://musou.tw/focuses/1025"
  },
  {
      name : "背負「政二代」標籤，呂孫綾能證明自己？",
      link : "http://musou.tw/focuses/1028"
  },
  {
      name : "王寶萱：對老師江宜樺從感動到失望，新政治要靠社會力量",
      link : "http://musou.tw/focuses/1031"
  },
  {
      name : "最欣賞蔣經國 蔣萬安：國民黨也是有年輕人參選！",
      link : "http://musou.tw/focuses/1063"
  },
  {
      name : "和哥哥「難攻大士」路線不同 鄭運鵬：發言人跟斯斯一樣",
      link : "http://musou.tw/focuses/1066"
  },
  {
      name : "灣生孫女、伴侶是「前689」 呂欣潔要把多元性別觀點帶進國會",
      link : "http://musou.tw/focuses/1073"
  }
];
*/
const excludeList = [
  "人物誌》李慶元：國民黨提名就當選是不對的日期2015-9-1作者阿草簡介×我是阿草，是總編輯喔。",
  "【立委候選人系列人物誌】",
  "李慶元｜台北｜文山、南中正立委擬參選人",
  "人物誌》無法漠視不合理 黃國昌：我是「放不下」的人（上）日期2015-9-21作者阿草簡介×我是阿草，是總編輯喔。",
  "人物誌》無法漠視不合理 黃國昌：我是「放不下」的人（上）",
  "黃國昌｜新北｜金山、萬里、汐止、平溪、瑞芳、雙溪、貢寮立委擬參選人",
  "（全文完）",
  "--",
  "無法漠視不合理 黃國昌：我是「放不下」的人（下）",
  "有更多關於黃國昌的參政理念...",
  "http://musou.tw/focuses/1010",
  "日期2015-9-21作者阿草簡介×我是阿草，是總編輯喔。",
  "人物誌》無法漠視不合理 黃國昌：我是「放不下」的人（下）",
  "日期2015-9-22作者阿草簡介×我是阿草，是總編輯喔。",
  "黃國昌｜新北｜金山、萬里、汐止、平溪、瑞芳、雙溪、貢寮立委擬參選人",
  "無法漠視不合理 黃國昌：我是「放不下」的人（上）",
  "看黃國昌談求學以來的人生心路歷程...",
  "http://musou.tw/focuses/1008",  
  "人物誌》「政治不是搞好人好事代表」 柯建銘：我最瞭解王金平的痛苦日期2015-10-6作者阿草簡介×我是阿草，是總編輯喔。",
  "柯建銘｜新竹市立委擬參選人",
  "人物誌》病人哭，不是抗憂鬱劑就能解決——精神科醫師潘建志的「三顆藥」能讓台灣幸福？日期2015-10-13作者阿草簡介×我是阿草，是總編輯喔。",
  "潘建志｜台北市中山、松山區立委擬參選人"
];
function shouldExclude (text) {
    if(excludeList.indexOf(text)!==-1){ 
      return true;
    }else{
      return false;
    }
}  

function handleNode(v, contents, filter){
    var name = $(v).get(0).tagName;
    var text = $(v).text();
    
    //文字段落
    if(text.length > 0 && filter === 'all'){
        var textArray = $(v).html().split('<br>');

        textArray.map((item,j)=>{
            item = item.replace(/<(?:.|\n)*?>/gm, '').trim();
            if(item.length > 0){
                var shoudExcludeThis = shouldExclude(item);
                if(shoudExcludeThis === false){
                    contents.push(item);
                }
            }
        })     
        
    }
    if(name === "img"){
       contents.push($(v).attr('src'));
    }
    return;

};
var contents = [];
function getContent(task){
    var deferred = q.defer();
    contents = [];
    var request = 
        http.get(task.link, function(response) {
            var bodyChunks = [];
            response
            .on('data', function(chunk) {
                bodyChunks.push(chunk);
            })
            .on('end', function() {
                var body = Buffer.concat(bodyChunks);
                
                $ = cheerio.load(body,{decodeEntities: false});//decodeEntitties => 不要把中文轉成 &#x5F8C
                
                
                //開始 parse
                $('.article').children().map((i, el)=>{
                    
                    
                    handleNode(el, contents, 'all');

                    $(el).children().map((k, v)=>{
                        //李慶元的會少一段（ad-hoc）
                        if(contents.length === 1 && task.name === "李慶元：國民黨提名就當選是不對的"){
                            contents.push("政論節目常客台北市議員李慶元，七月中被國民黨以「毀損黨譽」開除黨籍。其實最早是受深藍的新黨徵招而踏入政壇的他，五年多前才在新黨政策下加入國民黨。這次他將以無黨籍獨立參選，希望結合各方勢力前進立法院。")
                        }
                        /////////

                        handleNode(v, contents, 'img');
                    })
                })
                deferred.resolve(contents);
            })
            .on('error', function(err) {
                deferred.resolve("error");
            });
        });

    return deferred.promise;
};

// create a queue object with concurrency 1
var queue = async.queue(function (task, callback) {
      console.log('hello ' + task.name);
      getContent(task).then(function(contents){
          console.log(contents.length);
          MusouArticles[task.name] = contents;
          callback();
      })



}, 1);

// assign a callback
queue.drain = function() {
    fs.writeFile('./results/musou.json', JSON.stringify(MusouArticles, null, 4), function (err) {
      if (err) return console.log(err);
      console.log(clc.bgGreen('musou.json is saved.'));

    });
};

// Main intro
articleList.map((item, index)=>{
  queue.push(item, function (err) {
      console.log("finish processing:"+item.name);
  });
})
        




