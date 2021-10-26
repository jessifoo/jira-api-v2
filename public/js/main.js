(function($) {

	"use strict";

	$('[data-toggle="tooltip"]').tooltip()

})(jQuery);


async function loadIntoTable(url,table){
	const tableHead = table.querySelector("thead")
	const tableBody = table.querySelector("tbody")
	const response = await fetch(url)
	const data = await response.json();

	console.log(data)

}

loadIntoTable('http://10.0.0.139:8000/bugs',document.querySelector('table'))