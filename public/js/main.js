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

loadIntoTable('https://jira-api-v2.herokuapp.com:3000/bugs',document.querySelector('table'))