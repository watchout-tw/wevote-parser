var moment = require('moment')
export default function date2milliseconds(date_string){
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