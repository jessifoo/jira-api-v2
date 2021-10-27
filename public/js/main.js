$(document).ready(function() {
	const name = document.getElementById("helper").getAttribute("data-name");
	console.log(name);

	$('#mydatatable').DataTable({
		'deferRender':    true,
		'ajax': 'https://jira-api-v2.herokuapp.com/bugs',
		// 'ajax': 'https://localhost:3000/bugs',
		"lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
		'aoColumns': [
			{'mData':'client_ticket',
			"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
				$(nTd).html(`<a href="https://curatio.atlassian.net/browse/${oData.client_ticket}" target="_blank">${oData.client_ticket}</a>`);
			}},
			{'mData':'internal_ticket',
			"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
				$(nTd).html(`<a href="https://curatio.atlassian.net/browse/${oData.internal_ticket}" target="_blank">${oData.internal_ticket}</a>`);
			}},
			{'mData':'severity_level'},
			{'mData':'summary'},
			{'mData':'reporter'},
			{'mData':'target'},
			{'mData':'component'},
			{'mData':'status'},
			{'mData':'version'},
			{'mData':'created'},
			{'mData':'fixDate'}
		],
	    rowCallback: function (row, data) {
			const status = data.status
			switch (status) {
				case 'To Do': $('td:eq(7)', row).addClass("btn-secondary");
				break;
				case 'In Progress': $('td:eq(7)', row).addClass("btn-primary");
				break;
				case 'Icebox': $('td:eq(7)', row).addClass("btn-info");
				break;
				case 'In Review': $('td:eq(7)', row).addClass("btn-warning");
				break;
				case 'Done': $('td:eq(7)', row).addClass("btn-success");
				break;
				case 'Planning': $('td:eq(7)', row).addClass("btn-dark");
				break;
			}
		 }
	});
} );

async function loadIntoTable(url,table){
	const tableHead = table.querySelector("thead")
	const tableBody = table.querySelector("tbody")
	const tableFoot = table.querySelector("tfoot")
	const response = await fetch(url)
	const data = await response.json();
	const { headers, rows } = data

	// Clear table
	tableHead.innerHTML = '<tr></tr>'
	tableFoot.innerHTML = '<tr></tr>'
	tableBody.innerHTML = ''

	// Populate headers
	let collumm = 0
	headers.forEach(header => {
		collumm ++
		const headerElement = document.createElement('th')
		headerElement.textContent = header
		tableHead.querySelector("tr").appendChild(headerElement)
	});

	// Populate Rows
	rows.forEach(row => {
		const rowElement = document.createElement('tr')
		let collumm = 0
		row.forEach(cellText => {
			collumm ++
			const cellElement = document.createElement('td')
			cellElement.textContent = cellText

			if(collumm <= 2){
				cellElement.innerHTML = `<td><a href="https://curatio.atlassian.net/browse/${cellText}" target="_blank">${cellText}</a></td>`
			}

			if(collumm == 3){
				cellElement.innerHTML = `<td style="white-space:nowrap">${cellText.substring(0, 50)}</td>`
			}

			if(collumm == 7){
				const status = cellText
				switch (status) {
					case 'To Do': cellElement.innerHTML = `<td><a href="#" class="btn btn-secondary">${cellText}</a></td>`
					break;
					case 'In Progress': cellElement.innerHTML = `<td><a href="#" class="btn btn-primary">${cellText}</a></td>`
					break;
					case 'Icebox': cellElement.innerHTML = `<td><a href="#" class="btn btn-info">${cellText}</a></td>`
					break;
					case 'In Review': cellElement.innerHTML = `<td><a href="#" class="btn btn-warning">${cellText}</a></td>`
					break;
					case 'Done': cellElement.innerHTML = `<td><a href="#" class="btn btn-success">${cellText}</a></td>`
					break;
					case 'Planning': cellElement.innerHTML = `<td><a href="#" class="btn btn-dark">${cellText}</a></td>`
					break;
					
				}
			}
			rowElement.appendChild(cellElement)
		})

		tableBody.appendChild(rowElement)
	});	
}
