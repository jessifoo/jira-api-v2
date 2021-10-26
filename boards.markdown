# Resources

    GET /boards

## Description
Get all the boards in Jira


## Return Format

- `id`: Board Id.
- `name`: Board Name

## Example

**Request** 
    
    GET boards

**Return** 
```json
{
    "boards": [
        {
            "id": 27,
            "name": "MB board"
        },
        {
            "id": 14,
            "name": "Backend"
        },
        {
            "id": 15,
            "name": "DevOps+Admin"
        },
        {
            "id": 17,
            "name": "SITE board"
        },
        {
            "id": 18,
            "name": "SS board"
        },
        {
            "id": 19,
            "name": "UX board"
        },
        {
            "id": 20,
            "name": "PER board"
        },
        {
            "id": 2,
            "name": "WEB board"
        },
        {
            "id": 1,
            "name": "AND board"
        },
        {
            "id": 28,
            "name": "OKR board"
        },
        {
            "id": 24,
            "name": "UX & Product"
        },
        {
            "id": 7,
            "name": "IOS board"
        },
        {
            "id": 22,
            "name": "MOB board"
        },
        {
            "id": 30,
            "name": "NV board"
        },
        {
            "id": 31,
            "name": "NPM board"
        },
        {
            "id": 29,
            "name": "SAN board"
        },
        {
            "id": 34,
            "name": "DM board"
        },
        {
            "id": 33,
            "name": "COV board"
        }
    ]
}
```
