# Node.js Express API with MongoDB

This is a simple RESTful API built using Node.js and Express, with MongoDB as the chosen database. It allows you to perform CRUD (Create, Read, Update, Delete) operations on a "Person" resource.

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js and npm (Node Package Manager)
- MongoDB

## Getting Started

1. Clone the repository to your local machine:

```bash
 git clone git@github.com:Oludayo20/hngx-task-two.git
 cd hngx-task-two
```

2. Install the project dependencies:

```bash
 npm install
```

3. Configure MongoDB:

Ensure that MongoDB is running locally on your machine. You can customize the MongoDB connection settings in the code.

4. Start the API:

```bash
 npm start
```

or use this for development mode

```bash
npm run dev
```

The API will start running on http://localhost:3500 or the port specified in your environment variables.

## API Endpoints

### Create a New Person

- URL: /api
- Method: POST
- Request Body: JSON object with name properties
- Response: JSON object with the created person's details

### Retrieve a Person by ID

- URL: /api/:id
- Method: GET
- Response: JSON object with the person's details or an error message if not found

### Get all Person

- URL: /api/get-all-persons
- Method: GET
- Response: An array of JSON object with the each person details or an error message if there no person

### Update a Person by ID

- URL: /api/:id
- Method: PATCH
- Request Body: JSON object with updated name and age
- Response: JSON object with the updated person's details or an error message if not found

### Delete a Person by ID

- URL: /api/:id
- Method: DELETE
- Response: JSON message indicating successful deletion showing the person name and id or an error message if not found

## Error Handling

The API handles errors gracefully, providing appropriate error messages and status codes for various scenarios.

## Dependencies

- Express.js: A web application framework for Node.js.
- Mongoose: An ODM (Object Data Modeling) library for MongoDB.
- dotenv: For evn file.
- express-async-handler: A middleware for handling exceptions inside of \* \* async express routes and passing them to express error handlers.
- mongoose-sequence: To create fields which autoincrement their value.

## Contributing

Feel free to contribute to this project by opening issues or submitting pull requests.
