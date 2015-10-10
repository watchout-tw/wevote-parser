
var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var cht2eng = require('./utils/cht2eng');
let evadingLegislators = {};

	
    console.log("evadingLegislators")
	fs.createReadStream('./evading.csv')
  	  .pipe(csv())
      .on('data', function(data) {
	     
	      let issue = data['議題名稱'];
	      let issueEng = cht2eng(issue);
          let legislator = data['立委名'];
	      let party = cht2eng(data['當時的政黨']);

	      if(!evadingLegislators[issueEng])
	      	  evadingLegislators[issueEng] = {};

	      evadingLegislators[issueEng][legislator] = {
	      	  name : legislator,
	      	  party : party
	      };
	     
	     
      })
      .on('error', function (err)  { console.error('Error', err);})
      .on('end',   function ()     { 
      	  console.log("END")
          fs.writeFile('evadingLegislators.json', JSON.stringify(evadingLegislators, null, 4), function (err) {
  			if (err) return console.log(err);
  			
  			console.log(clc.bgGreen('evadingLegislators is saved.'));
	      });
        
      });  

	
