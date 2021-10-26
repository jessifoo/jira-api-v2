# Resources

    GET /:boardId/:state/sprints

## Description
Get all the sprints from a board. It can be active or closed sprints.

## Parameters

- `boardId`: Board Id.
- `state`: Active or Closed

## Return Format

- `id`: Sprint Id.
- `name`: Sprint Name,
- `startDate`: Start Date,
- `endDate`: End Date

## Example

**Request** 
    
    GET boardId state sprints

**Data**
    /27/active/sprints

**Return** 
```json
{
    "sprints": [
        {
            "id": 170,
            "name": "CovidConnect",
            "startDate": "2020-04-21T21:53:00.000Z",
            "endDate": "2020-04-28T21:53:00.000Z"
        },
        {
            "id": 180,
            "name": "MB-Sprint 14(Jun 30-Jul 13)",
            "startDate": "2020-06-30T20:20:18.857Z",
            "endDate": "2020-07-13T07:41:00.000Z"
        }
    ]
}
```
