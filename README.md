##setup

$ **git clone** git@github.com:watchout-tw/wevote-parser.git

$ cd wevote-parser

$ npm install



##data

`資料表 > 議題表態資料` 這個 tab ，下載成 .csv 檔，放到 `/parseIssue/data.csv`.

`資料表 > 人的基本資料` 這個 tab ，下載成 .csv 檔，放到 `/parseLegislator/data.csv`.



##parse


#### 1.處理議題資料

npm run parseIssue

議題的相關資料會存到 /parseIssue 底下（.json）
 

#### 2.處理人的資料

npm start

人的相關資料會存到 /parseLegislator 底下（.json）