## API Documentation

### Base URL

The base URL for this API is `https://github.com/Oludayo20/hngx-task-two`.

### Endpoints

#### 1. Get All Persons

- **URL**: `/get-all-persons`
- **HTTP Method**: GET
- **Description**: Retrieves a list of all persons.
- **Parameters**:
  - None
- **Response**:
  - Status Code: 200 (OK)
  - Content Type: `application/json`
  - Response Body: A list of `Person` objects.
- **Example**:
  ```json
  [
    {
      "id": 123456789,
      "name": "John Doo"
    },
    {
      "id": 245864327,
      "name": "Oludayo Elijah"
    }
  ]
  ```

#### 2. Get Person by ID

- **URL**: `/{id}`
- **HTTP Method**: GET
- **Description**: Retrieves a person by their ID.
- **Parameters**:
  - `id` (Path Parameter) - The ID of the person to retrieve.
- **Response**:
  - Status Code: 200 (OK) if the person is found.
  - Status Code: 404 (Not Found) if the person is not found.
  - Content Type: `application/json`
  - Response Body: A `Person` object if found.
- **Example (Found)**:
  ```json
  {
    "id": 245864327,
    "name": "Oludayo Elijah"
  }
  ```
- **Example (Not Found)**:
  ```json
  {
    "error": "Person not found"
  }
  ```

#### 3. Create a New Person

- **URL**: `/`
- **HTTP Method**: POST
- **Description**: Creates a new person.
- **Parameters**:
  - Request Body (JSON) - A `PersonRequest` object with a `Name` field.
- **Response**:
  - Status Code: 201 (Created) if the person is created successfully.
  - Status Code: 400 (Bad Request) if the request is invalid (e.g., missing or empty `Name`).
  - Content Type: `application/json`
  - Response Body: A `Person` object representing the newly created person.
- **Example (Created)**:
  ```json
  {
    "id": 245864327,
    "name": "Oludayo Elijah"
  }
  ```
- **Example (Bad Request)**:
  ```json
  {
    "error": "Person name is required."
  }
  ```

#### 4. Update an Existing Person

- **URL**: `/{id}`
- **HTTP Method**: PUT
- **Description**: Updates an existing person.
- **Parameters**:
  - Request Body (JSON) - A `Person` object with an `Id` and a `Name` field.
- **Response**:
  - Status Code: 200 (OK) if the person is updated successfully.
  - Status Code: 404 (Not Found) if the person with the specified ID is not found.
  - Status Code: 400 (Bad Request) if the request is invalid (e.g., missing or empty `Name`, or `Id` is 0).
  - Content Type: `application/json`
  - Response Body: A `Person` object representing the updated person if successful.
- **Example (Updated)**:
  ```json
  {
    "id": 245864327,
    "name": "Oludayo Elijah"
  }
  ```
- **Example (Not Found)**:
  ```json
  {
    "error": "Person not found."
  }
  ```
- **Example (Bad Request)**:
  ```json
  {
    "message": "Id and name are required"
  }
  ```

#### 5. Delete a Person by ID

- **URL**: `/{id}`
- **HTTP Method**: DELETE
- **Description**: Deletes a person by their ID.
- **Parameters**:
  - `id` (Path Parameter) - The ID of the person to delete.
- **Response**:
  - Status Code: 200 (OK) if the person is deleted successfully.
  - Status Code: 404 (Not Found) if the person with the specified ID is not found.
- **Example (Deleted)**:
  ```json
  {
    "message": "John Doo with ID 650321fe2239237 deleted"
  }
  ```
- **Example (Not Found)**:
  ```json
  {
    "error": "Person not found."
  }
  ```
- **PS hosted link:** https://hngx-8fg7.onrender.com/api/
