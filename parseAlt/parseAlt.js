var fs = require('fs')
var csv = require('csv-parser')
var clc = require('cli-color')
var cht2eng = require('../utils/cht2eng');

var Slides = [];
fs.createReadStream('parseAlt/data.csv')
  .pipe(csv())
  .on('data', function(data) {
	  
      Slides.push({
        filename: data['filename'],
        alt: data['alt']
      })
   
  })
  .on('error', function (err)  { console.error('Error', err);})
  .on('end',   function ()     { 
  	
	  fs.writeFile('./results/slidesAlt.json', JSON.stringify(Slides, null, 4), function (err) {
  		if (err) return console.log(err);
  		console.log(clc.bgGreen('slidesAlt.json is saved.'));

	  });
	  
  });  

