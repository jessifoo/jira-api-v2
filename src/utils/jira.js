const JiraClient  = require("jira-connector");
 
const jira = new JiraClient({
  host: process.env.JIRA_HOST,
  basic_auth: {
    email: process.env.JIRA_EMAIL,
    api_token: process.env.JIRA_API_TOKEN
  }
});

// adding function to Date
Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

const getAllBugsReadFormat = async (callback) => {
  try {
    
    const bugs = getAllBugs((error,data) => {
      if(error){
        return callback(error, undefined)
      }

      const issues = data
      const rows = []
      issues.map(issue => {
        rows.push([issue.internal_ticket,
          issue.client_ticket,
          issue.summary,
          issue.reporter,
          issue.target,
          issue.component,
          issue.status,
          issue.version,
          issue.created])
      })

      let tableFormat = {
        headers: ['Internal Ticket','Client Ticket','Summary','Reporter','Target','Platform','Status','Version','Created'],
        rows
      }

      return callback(undefined, tableFormat)
    })
  } catch (error) {
    callback(error, undefined)
  }
}

// get all open issues on the bug board 
// **** and key=NV-3321
const getAllBugs = async (target, callback) => {
  try {
    let listOfIssues = []
    jira.search.search({
        jql: `project in ("Web Dev","Feature Team",SUP2) and "Target[Select List (multiple choices)]" IN ("${target}") and type = Bug and (creator = "Deep Clone for Jira" or "Reference Ticket Number[Labels]" is not EMPTY) ORDER BY created DESC`,
        maxResults: 1000
    }, (error, result)  => {
        if (error) throw error;         
        const issues = result.issues;                  
        issues.map(issue => {

            // Get client Ticket number
            // - if the ticket was cloned then we get it from the clone linked issue 
            // - if the ticket was moved then we get from the custom field Reference Ticket Number
            
            let clientTicket = undefined
            let clientIndex = 0

            console.log(issue.key);
              
            if(issue.fields.customfield_10873 !== null){
              clientTicket = issue.fields.customfield_10873[0] // Reference Ticket Number ( Custom Field Locator )
            }
            
            while (clientTicket == undefined) {
              if(issue.fields.issuelinks[clientIndex].outwardIssue == undefined){
                clientIndex++;
              } else {
                clientTicket = issue.fields.issuelinks[clientIndex].outwardIssue.key
              } 
            }

            // Severity Level
            let sevLevel = 'not assigned'
            let sevLevelCode = 0
            if(issue.fields.customfield_10812 !== null){
              sevLevel = issue.fields.customfield_10812.value
              if(sevLevel != 'Not A Bug'){
                sevLevelCode = sevLevel.split('-')[0];
              }
            }

            // Version
            let versionDesc = undefined
            if(issue.fields.fixVersions[0] == undefined) {
              versionDesc = 'not assigned'
            } else {
              const versions = issue.fields.fixVersions
              versions.forEach(varsion => {
                if (versionDesc == null){
                  versionDesc = varsion.name
                } else {
                  versionDesc = versionDesc + ', ' + varsion.name
                }
              })
            }

            // Component
            let component = undefined
            if(issue.fields.components[0] === undefined){
              component = 'not assigned'
            } else {
              component = issue.fields.components[0].name
            }

            // Get taget that issue belongs to
            let targetDesc = null
            if(issue.fields.customfield_10859 === null){
              if(component == 'Webapp'){
                targetDesc = component
              } else {
                targetDesc = 'not assigned'
              }
            } else {
              const targets = issue.fields.customfield_10859
              targets.forEach(target => {
                if (targetDesc == null){
                  targetDesc = target.value
                } else {
                  targetDesc = targetDesc + ', ' + target.value
                }
              })
            }

            // get bug reporter
            let description = issue.fields.description
            description = description.split(':')[1];
            description = description.split(' - ')[0]
            let reporter = description.substring(2)

            // date bug was created
            const date = new Date(issue.fields.created);
            const created = date.toLocaleString('en-US', {
              day: 'numeric', // numeric, 2-digit
              year: 'numeric', // numeric, 2-digit
              month: 'numeric' // numeric, 2-digit, long, short, narrow
            });

            // fix date based on the create date and severity level
            let fixDate = ''
            switch (sevLevelCode){
              case '1': fixDate = date.addDays(7).toLocaleString('en-US', {
                day: 'numeric', // numeric, 2-digit
                year: 'numeric', // numeric, 2-digit
                month: 'numeric' // numeric, 2-digit, long, short, narrow
              })
              break;
              case '2': fixDate = date.addDays(15).toLocaleString('en-US', {
                day: 'numeric', // numeric, 2-digit
                year: 'numeric', // numeric, 2-digit
                month: 'numeric' // numeric, 2-digit, long, short, narrow
              })
              break;
              case '3': fixDate = date.addDays(30).toLocaleString('en-US', {
                day: 'numeric', // numeric, 2-digit
                year: 'numeric', // numeric, 2-digit
                month: 'numeric' // numeric, 2-digit, long, short, narrow
              })
              break;
            }

            listOfIssues.push({
              client_ticket: clientTicket, 
              internal_ticket: issue.key,
              severity_level: sevLevel,
              summary: issue.fields.summary,
              reporter,
              target: targetDesc,
              component,
              status: issue.fields.status.name,
              version: versionDesc,
              created,
              fixDate
            })
        })
      callback(undefined, listOfIssues)
    });
  } catch (error) {
    callback(error, undefined)
  }
}

// read all boards
const getAllBoards = async (callback) => {
  try {
    const allBoards = await jira.board.getAllBoards()
        // console.log(allBoards);
    if(allBoards.values === '') {
      return callback('No boards found', undefined)
    }
    const boards = []
    allBoards.values.forEach(board => {
        boards.push({ id: board.id, name: board.name })
    });
    
    callback(undefined, boards)
  } catch (error) {
    callback(error, undefined)
  }
 
}
// read all sprints from board
const getSprints = async (boardId, state, callback) => {
  try {
    // const allSprints = await jira.board.getAllSprints({boardId, state})
    const allSprints = await jira.board.getAllSprints({boardId, startAt: 80, maxResults: 15})
    console.log(allSprints);
    if(allSprints.values === '') {
      callback('No sprints found', undefined)
    }
    
    const sprints = []    
    allSprints.values.forEach(sprint => {
        sprints.push({ id: sprint.id, name: sprint.name, startDate: sprint.startDate, endDate: sprint.endDate })
    });
    callback(undefined, sprints)
  } catch (error) {
    callback(error, undefined)
  }
 
}

// // get all issues from sprint
// const getIssuesFromSprint = async (sprintId, callback) => {
//   try {
//     const allIssues = await jira.sprint.getSprintIssues({sprintId, maxResults: 300})
    
//     let assigneeComponent = []
//     assigneeComponent['Alireza Kamali'] = 'iOS'
//     assigneeComponent['Javad Hatami'] = 'Android'
//     assigneeComponent['Josue Cabrera'] = 'iOS'
//     assigneeComponent['Mehrdad Faraji'] = 'iOS'
//     assigneeComponent['Mohammad Feyzian'] = 'Android'
//     assigneeComponent['Mostafa Davodi'] = 'iOS'
//     assigneeComponent['Rostislav Chekan'] = 'Android'
//     assigneeComponent['Samad Kardan'] = 'Backend'
//     assigneeComponent['Vahid Kardan'] = 'Backend'
//     assigneeComponent['Hamza Yousaf'] = 'Android'
//     assigneeComponent['Hafiz Faraz Tariq'] = 'Android'
//     assigneeComponent['Kaden Kim'] = 'iOS'
//     assigneeComponent['Darshan Parikh'] = 'Android'
//     assigneeComponent['Christina Lee'] = 'UX/UI'
//     assigneeComponent['Daniela de Oliveira'] = 'UX/UI'
    
//     const issues = []
//     const users = []
//     const forLoop = async _ => {
//       for (let index = 0; index < allIssues.issues.length; index++) {
//         const issue = allIssues.issues[index]
        
//         const assignee = issue.fields.assignee === null ? 'not assigned' : issue.fields.assignee.displayName;

//         // component assigned by assignee
//         let component = assigneeComponent[assignee]

//         const severity = issue.fields.customfield_10812 === null ? 'not assigned' : issue.fields.customfield_10812.value
//         const sprints  = issue.fields.customfield_10122.map( sprint => {
//           return {
//             id: sprint.id,
//             name: sprint.name
//           };
//         })

//         // const labels = issue.fields.labels;

//         const labels = issue.fields.labels.filter(label => label.includes('Reviewed'));
//         const status = issue.fields.status.name;

//         if(status === 'Done' && labels.length === 0) {
//           labels.push('Reviewed')
//         }

//         issues.push({
//           type: issue.fields.issuetype.name,
//           key: issue.key,
//           description: issue.fields.description,
//           summary: issue.fields.summary,
//           assignee: assignee,
//           status: status,
//           component: component,
//           commit: issue.fields.customfield_10000.includes('pullrequest') ? true : false,
//           version: issue.fields.fixVersions.length === 0 ? 'no version assigned' : issue.fields.fixVersions[0].name,
//           reviews: labels,
//           story_points: issue.fields.customfield_10124,
//           severity: severity,
//           priority: issue.fields.priority.name,
//           sprints: sprints,
//           link: `https://${process.env.JIRA_HOST}/browse/${issue.key}`
//         })

//         const userAdded = users.some(user => user.name === assignee)
//         if(!userAdded) {
//           users.push({name: assignee})
//         }
//       }
//     }

//     forLoop()
    
//     callback(undefined, issues,users)
//   } catch (error) {
//     callback(error, undefined)
//   }
// }

module.exports = { getAllBoards, getSprints, getAllBugs }