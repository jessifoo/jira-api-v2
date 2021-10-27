const express = require('express')
const router = new express.Router()
const jira = require('../utils/jira')

// read all boards
router.get('/boards', (req, res) => {

  try {
    jira.getAllBoards((error, data) => {
      if(error){
        return res.status(400).send(error)
      }

      res.status(200).send({boards:data})
    })
  } catch (error) {
    res.status(400).send(error)
  }
  
})

// read all bugs
router.get('/bugs/:target', (req, res) => {

  const target = req.params.target
  const targetList = [
    'Calquence',
    'Curatio',
    'Heart Life',
    'MS121',
    'Next Gen',
    'SCD Arabic Female',
    'SCD Arabic Male',
    'SCD Europe',
    'SCD India',
    'SCD US',
    'Stronger Together',
    'Freedom Friend']


  try {
    jira.getAllBugs((error, data) => {
      if(error){
        return res.status(400).send(error)
      }

      // return data based on target
      const targetData = data.filter(issue => issue.target === targetList[target])

      res.status(200).send({targetData})
    })
  } catch (error) {
    res.status(400).send(error)
  }
  
})


// read all sprints
// states: ACTIVE / CLOSED / FUTURE
router.get('/:boardId/:state/sprints', (req, res) => {

  const boardId = req.params.boardId
  const state = req.params.state

  try {
 
    jira.getSprints(boardId, state,(error,data) => {
      if(error){
        return res.status(400).send(error)
      }

      res.status(200).send({sprints:data})
    })
  } catch (error) {
    res.status(400).send(error)
  }
  
})

// read all issues from sprint
router.get('/:sprintId/issues', (req, res) => {

  const sprintId = req.params.sprintId

  try {
 
    jira.getIssuesFromSprint(sprintId,(error, data, users) => {
      if(error){
        return res.status(400).send(error)
      }

      res.status(200).send({issues:data})
    })
  } catch (error) {
    res.status(400).send(error)
  }
  
})

// read all issues from sprint
router.get('/:sprintId/summary', (req, res) => {

  const sprintId = req.params.sprintId

  try {
    jira.getIssuesFromSprint(sprintId,(error, data, users) => {
      if(error){
        return res.status(400).send(error)
      }

      const issues = data
      const issuesAssignees = []
      const reducer = (accumulator, currentValue) => accumulator + currentValue;

      users.forEach(user => {        
        const assignee    = issues.filter(issue => issue.assignee === user.name)
        const totalSP     = assignee.reduce((total, currentValue) => total + currentValue.story_points,0)

        const commited    = assignee.filter(issue => issue.commit === true && issue.status === 'Done')
        const notCommited = assignee.filter(issue => issue.commit !== true && issue.status === 'Done')
        const inReview    = assignee.filter(issue => issue.status === 'In Review')
        const inTodo      = assignee.filter(issue => issue.status === 'To Do')
        const blocked     = assignee.filter(issue => issue.status === 'Blocked')
        const pending     = assignee.filter(issue => issue.status === 'Pending')
        const inProgress  = assignee.filter(issue => issue.status === 'In Progress')
        const done        = assignee.filter(issue => issue.status === 'Done')
        const totalSPDone = done.reduce((total, currentValue) => total + currentValue.story_points,0)

          //  committed: {total: commited.length, cards: commited.map(issue => { return { type: issue.type, key: issue.key, summary: issue.summary, status: issue.status }})},
          //   notCommitted: {total: notCommited.length, cards: notCommited.map(issue => { return { type: issue.type, key: issue.key, summary: issue.summary, status: issue.status }})},
          //   todo: {total: inTodo.length, cards: inTodo.map(issue => { return { type: issue.type, key: issue.key, summary: issue.summary, status: issue.status }})},
          //   progress: {total: inProgress.length, cards: inProgress.map(issue => { return { type: issue.type, key: issue.key, summary: issue.summary, status: issue.status }})},
          //   blocked: {total: blocked.length, cards: blocked.map(issue => { return { type: issue.type, key: issue.key, summary: issue.summary, status: issue.status }})},
          //   pending: {total: pending.length, cards: pending.map(issue => { return { type: issue.type, key: issue.key, summary: issue.summary, status: issue.status }})},
          //   review: {total: inReview.length, cards: inReview.map(issue => { return { type: issue.type, key: issue.key, summary: issue.summary, status: issue.status }})},
          //   done: {total: done.length, cards: done.map(issue => { return { type: issue.type, key: issue.key, summary: issue.summary, status: issue.status }})}



        issuesAssignees.push({
            user: user.name, 
            totalIssues: assignee.length,
            totalSP: totalSP,
            totalSPDone: totalSPDone,
            committed: {total: commited.length},
            notCommitted: {total: notCommited.length},
            todo: {total: inTodo.length},
            progress: {total: inProgress.length},
            blocked: {total: blocked.length},
            pending: {total: pending.length},
            review: {total: inReview.length},
            done: {total: done.length}
          })
      });

      res.status(200).send({
        issues: issuesAssignees
      })
    })
  } catch (error) {
    console.log('ERROR',error);
    
    res.status(400).send(error)
  }
  
})

// read all issues from sprint
router.get('/:sprintId/reviews', (req, res) => {

  const sprintId = req.params.sprintId

  try {
    jira.getIssuesFromSprint(sprintId,(error, data) => {
      if(error){
        return res.status(400).send(error)
      }
      
      const issues = data
      let reviewCards = []
      let bugsCards = []
      // Bugs per Severity

      const bugUXUICards      = issues.filter(issue => issue.component === 'UX/UI' && issue.type === 'Bug')
      const taskUXUICards     = issues.filter(issue => issue.component === 'UX/UI' && issue.type !== 'Bug')
      const bugAndroidCards   = issues.filter(issue => issue.component === 'Android' && issue.type === 'Bug')
      const bugiOSCards       = issues.filter(issue => issue.component === 'iOS' && issue.type === 'Bug')
      const tasksAndroidCards = issues.filter(issue => issue.component === 'Android' && issue.type !== 'Bug')
      const tasksiOSCards     = issues.filter(issue => issue.component === 'iOS' && issue.type !== 'Bug')
      const bugBackendCards   = issues.filter(issue => issue.component === 'Backend' && issue.type === 'Bug')
      const tasksBackendCards = issues.filter(issue => issue.component === 'Backend' && issue.type !== 'Bug')

      bugsCards.push({
        severity: {
          android: {
            level1: bugAndroidCards.filter(issue => issue.severity === '1-A critical incident').length,
            level2: bugAndroidCards.filter(issue => issue.severity === '2-A major incident').length,
            level3: bugAndroidCards.filter(issue => issue.severity === '3-A minor incident').length,
            level4: bugAndroidCards.filter(issue => issue.severity === `4-Don't fix it`).length,
            not_assigned: bugAndroidCards.filter(issue => issue.severity === `not assigned`).length
          },
          ios: {
            level1: bugiOSCards.filter(issue => issue.severity === '1-A critical incident').length,
            level2: bugiOSCards.filter(issue => issue.severity === '2-A major incident').length,
            level3: bugiOSCards.filter(issue => issue.severity === '3-A minor incident').length,
            level4: bugiOSCards.filter(issue => issue.severity === `4-Don't fix it`).length,
            not_assigned: bugiOSCards.filter(issue => issue.severity === `not assigned`).length
          },
          backend: {
            level1: bugBackendCards.filter(issue => issue.severity === '1-A critical incident').length,
            level2: bugBackendCards.filter(issue => issue.severity === '2-A major incident').length,
            level3: bugBackendCards.filter(issue => issue.severity === '3-A minor incident').length,
            level4: bugBackendCards.filter(issue => issue.severity === `4-Don't fix it`).length,
            not_assigned: bugBackendCards.filter(issue => issue.severity === `not assigned`).length
          }
        },
        platform: {
          android_bugs: {
            total_sprint: bugAndroidCards.length,
            total_rollover:  bugAndroidCards.filter(issue => issue.status !== 'Done').length 
          },
          ios_bugs: {
            total_sprint: bugiOSCards.length,
            total_rollover:  bugiOSCards.filter(issue => issue.status !== 'Done').length 
          },
          backend_bugs: {
            total_sprint: bugBackendCards.length,
            total_rollover:  bugBackendCards.filter(issue => issue.status !== 'Done').length 
          },
          android_tasks: {
            total_sprint: tasksAndroidCards.length,
            total_rollover: tasksAndroidCards.filter(issue => issue.status !== 'Done').length 
          },
          ios_tasks: {
            total_sprint: tasksiOSCards.length,
            total_rollover: tasksiOSCards.filter(issue => issue.status !== 'Done').length
          },
          backend_tasks: {
            total_sprint: tasksBackendCards.length,
            total_rollover: tasksBackendCards.filter(issue => issue.status !== 'Done').length
          },
          uxui_tasks: {
            total_sprint: taskUXUICards.length,
            total_rollover: taskUXUICards.filter(issue => issue.status !== 'Done').length
          },
          uxui_bugs: {
            total_sprint: bugUXUICards.length,
            total_rollover: bugUXUICards.filter(issue => issue.status !== 'Done').length
          }
        }
      })

      // Check number of reviews
      const androidCards = issues.filter(issue => issue.component === 'Android' && issue.status === 'Done')
      let review1 = androidCards.filter(issue => issue.reviews.length === 1)
      let review2 = androidCards.filter(issue => issue.reviews.length === 2)
      let review3 = androidCards.filter(issue => issue.reviews.length === 3)
      let review4 = androidCards.filter(issue => issue.reviews.length === 4)
      let review5 = androidCards.filter(issue => issue.reviews.length === 5)

      reviewCards.push({
        Android:{
          review1: review1.length,
          review2: review2.length,
          review3: review3.length,
          review4: review4.length,
          review5: review5.length
        }});
    
      const iOSCards = issues.filter(issue => issue.component === 'iOS' && issue.status === 'Done')
      review1 = iOSCards.filter(issue => issue.reviews.length === 1)
      review2 = iOSCards.filter(issue => issue.reviews.length === 2)
      review3 = iOSCards.filter(issue => issue.reviews.length === 3)
      review4 = iOSCards.filter(issue => issue.reviews.length === 4)
      review5 = iOSCards.filter(issue => issue.reviews.length === 5)
      reviewCards.push({
        iOS:{        
          review1: review1.length,
          review2: review2.length,
          review3: review3.length,
          review4: review4.length,
          review5: review5.length
          }
      });     

      res.status(200).send({
        reviewCards,
        bugsCards
      })
    })
  } catch (error) {
    console.log('ERROR',error);
    res.status(400).send(error)
  }
  
})

module.exports = router