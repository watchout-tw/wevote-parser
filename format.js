PartyView
/*
    "marriage_equality" : {
        "title" : 婚姻平權,
        "statement" : "婚姻不限性別",
        "partyPositions: [
            {
                "party" : "KMT",
                "dominantPosition" : "nay", // 主要立場
                "dominantPercentage" : "78.21", // 主要立場比例
                "records" : [ // 該政黨底下的表態記錄
                    {
                        "id" : "xxx", // 之後再一起給
                        "date" : xxxxxx, //date in timestamp in milliseconds
                        "legislator" : "丁守中",
                        "content" : "xxxxxxx",
                        "position" : "nay",
                        "clarificationContent" : "我沒有～",
                        "clarificationLastUpdate" : xxxx //date in timestamp in milliseconds
                    },
                    ...
                    next record
                ]
            },
            ... next party
    
        ]
    }
*/

LegislatorView
/*
    "marriageEquality" : {
        "title" : 婚姻平權,
        "statement" : "婚姻不限性別",
        "positions: [
            {
                "position" : "aye",
                "legislators" : [
                    {
                        "name" : '丁守中',
                        "party" : KMT,
                        "dominantPosition" : "aye", // 主要立場
                        "dominantPercentage" : "78.21", // 主要立場比例
                        "records" : [ // 該立委的相關表態記錄
                            {
                                "id" : "xxx", // 之後再一起給
                                "date" : xxxxxx, //date in timestamp in milliseconds
                                "legislator" : "丁守中",
                                "content" : "xxxxxxx",
                                "position" : "nay",
                                "clarificationContent" : "我沒有～",
                                "clarificationLastUpdate" : xxxx //date in timestamp in milliseconds
                            },
                            ...
                            next record
                        ]

                    },
                    ...
                    next legislator
                ]
                
                
            },
            ... next position
    
        ]
    }
*/

Position View
/*
    "marriageEquality" : {
        "title" : 婚姻平權,
        "statement" : "婚姻不限性別",
        "positions: [
            {
                "position" : "aye",
                "records" : [ // 該立委的相關表態記錄
                    {
                        "id" : "xxx", // 之後再一起給
                        "date" : xxxxxx, //date in timestamp in milliseconds
                        "legislator" : "丁守中",
                        "content" : "xxxxxxx",
                        "position" : "nay",
                        "clarificationContent" : "我沒有～",
                        "clarificationLastUpdate" : xxxx //date in timestamp in milliseconds
                    },
                    ...
                    next record
            },
            ... next position
    
        ]
    }
*/


SingleLegislatorView
/*
    "丁守中" : {
        "positions: {
            "marriageEquality": {
                "totalCounts" : 27,
                "positionCounts" : [
                    {
                        "position":"nay",
                        "count" : 14
                    },
                    {
                        "position":"unknow",
                        "count" : 1
                    },
                    {
                        "position":"aye",
                        "count" : 12
                    }
                ]
                "records" : [ // 該立委的相關表態記錄
                    {
                        "id" : "xxx", 
                        "date" : xxxxxx, //date in timestamp in milliseconds
                        "legislator" : "丁守中",
                        "content" : "xxxxxxx",
                        "position" : "nay",
                        "clarificationContent" : "我沒有～",
                        "clarificationLastUpdate" : xxxx //date in timestamp in milliseconds
                    },
                    ...
                    next record
            },
            ... next issue
    
        }
    }
*/

Single Party View
/*
{
    "中國國民黨": {
        "name": "中國國民黨",
        "positions": {
            "marriageEquality": {
                "records": [
                    {
                        "id": 23,
                        "issue": "婚姻平權",
                        "legislator": "丁守中",
                        "party": "KMT",
                        "date": 1383840000,
                        "category": "發言",
                        "content": "我完全同意同性戀者有相愛、同居也有財產自由處分的完全自主權利，但我更支持宗教團體，因為我是國際佛光會的副總會長。我認為對於宗教團體與一般人的傳統認知，也就是對家庭、對夫妻倫理與價值不應該改變。",
                        "positionJudgement": "反對同性婚姻合法化",
                        "position": "nay",
                        "clarificationContent": "",
                        "clarificationLastUpdate": "",
                        "lyURL": "http://lci.ly.gov.tw/LyLCEW/communique1/final/pdf/102/65/LCIDC01_1026501.pdf",
                        "meeting": "院會",
                        "meetingCategory": "院會質詢"
                    }
                ],
                "dominantPosition": "nay",
                "positionCounts": [
                    {
                        "position": "nay",
                        "count": 1
                    },
                    {
                        "position": "unknown",
                        "count": 0
                    },
                    {
                        "position": "aye",
                        "count": 0
                    }
                ],
                "totalCounts": 1
            },
            ... next issue
        }
    },
    ... next party   
*/