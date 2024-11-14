const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 9000;

app.use(express.json());


// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User and Places API',
      version: '1.0.0',
      description: 'An API for managing users and places',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local server',
      },
    ],
  },
  apis: ['./app.js'], // This points to your entry file (app.js)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// / - returns json data: { "home": "Home page" }  
app.get('/', (req, res) => {
  res.json({ home: "Home page" });
});



// /index -> returns json data: { "hello": 'Hello World!' }
app.get('/index', (req, res) => {
  res.json({ hello: "Hello World!" });
});

// /data -> returns json data e.g.: [{ “id”: “1”, “Firstname”: “Jyri”, “Surname”: “Kemppainen”}, { “id”: “2”, “Firstname”: “Petri”, “Surname”: “Laitinen”}
const users = [
    { id: "1", Firstname: "Jyri", Surname: "Kemppainen" },
    { id: "2", Firstname: "Petri", Surname: "Laitinen" }
  ];


  /**
 * @swagger
 * /data:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Returns a list of users with ID, Firstname, and Surname.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   Firstname:
 *                     type: string
 *                     example: "Jyri"
 *                   Surname:
 *                     type: string
 *                     example: "Kemppainen"
 */


app.get('/data', (req, res) => {
  res.status(200).json({
    status: "success",
    data: users,
  });
});


/**
 * @swagger
 * /data/{id}:
 *   get:
 *     summary: Retrieve a single user by ID
 *     description: Returns a single user with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: A single user object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 Firstname:
 *                   type: string
 *                   example: "Jyri"
 *                 Surname:
 *                   type: string
 *                   example: "Kemppainen"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 */

// /data/1 returns data from the line identified by id no 1, /data/2 return data from the line id no 2, etc.
app.get('/data/:id', (req, res) => {
    const userId = req.params.id;
    const user = users.find(u => u.id === userId);
  
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
});




/**
 * @swagger
 * /data:
 *   post:
 *     summary: Add a new user
 *     description: Creates a new user with the given ID, Firstname, and Surname.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - Firstname
 *               - Surname
 *             properties:
 *               id:
 *                 type: string
 *                 example: "3"
 *               Firstname:
 *                 type: string
 *                 example: "Maria"
 *               Surname:
 *                 type: string
 *                 example: "Virtanen"
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "3"
 *                 Firstname:
 *                   type: string
 *                   example: "Maria"
 *                 Surname:
 *                   type: string
 *                   example: "Virtanen"
 *       400:
 *         description: Bad request - missing or invalid fields, or duplicate ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: id, Firstname, Surname"
 *       415:
 *         description: Unsupported media type - Content-Type must be application/json.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unsupported Media Type. Content-Type must be application/json"
 */

// /data request that can be used to add a new user (with the same field names: id, Firstname, Surname) if id number in the request does not already exist in the data. Check also that the request has the valid fields only, and if not inform the client with appropriate http status code and error message.
app.post('/data', (req, res) => {
    const { id, Firstname, Surname } = req.body;
  
    // In your server validate if the input data is supported by the server. The accepted data format is application/json. If the request is not valid, send the response with the status code 415 Unsupported Media Type.
    if (req.headers['content-type'] !== 'application/json') {
        return res.status(415).json({ error: "Unsupported Media Type. Content-Type must be application/json" });
    }
  
    if (!id || !Firstname || !Surname) {
      return res.status(400).json({ error: "Missing required fields: id, Firstname, Surname" });
    }
  
    if (Object.keys(req.body).length !== 3) {
      return res.status(400).json({ error: "Only id, Firstname, and Surname are allowed in the request body" });
  }

    if (users.some(user => user.id === id)) {
      return res.status(400).json({ error: "User with this ID already exists" });
    }
  
    const newUser = { id, Firstname, Surname };
    users.push(newUser);
    res.status(201).json(newUser);
});


/**
 * @swagger
 * /places/{place_id}:
 *   delete:
 *     summary: Delete a place by ID
 *     description: Deletes a place with the specified ID. If the place does not exist, returns a 404 error.
 *     parameters:
 *       - in: path
 *         name: place_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the place to delete.
 *     responses:
 *       204:
 *         description: Place deleted successfully. No content is returned.
 *       404:
 *         description: Place not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Place not found"
 */

// DELETE /data/<data_id>

// Make sure you implement also the 404 (not found) status code for the case when the data can not be found.

// Again, test the operation using your favourite testing tool.

// d) Develop an operation for updating a place data:

let places = [
  { id: "1", name: "Central Park", location: "New York" },
  { id: "2", name: "Eiffel Tower", location: "Paris" }
];

app.delete('/places/:place_id', (req, res) => {
  const placeId = req.params.place_id;

  // Find the index of the place
  const index = places.findIndex(place => place.id === placeId);

  // If place is not found, return 404 Not Found
  if (index === -1) {
      return res.status(404).json({ error: "Place not found" });
  }

  // Remove the place from the array
  places.splice(index, 1);

  // Respond with 204 No Content as the place has been successfully deleted
  res.status(204).end();
});


/**
 * @swagger
 * /places/{place_id}:
 *   put:
 *     summary: Update or create a place
 *     description: Updates a place with the given ID if it exists; otherwise, creates a new place with the specified ID.
 *     parameters:
 *       - in: path
 *         name: place_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the place to update or create.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Louvre Museum"
 *               location:
 *                 type: string
 *                 example: "Paris"
 *     responses:
 *       200:
 *         description: Place updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 name:
 *                   type: string
 *                   example: "Louvre Museum"
 *                 location:
 *                   type: string
 *                   example: "Paris"
 *       201:
 *         description: New place created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "3"
 *                 name:
 *                   type: string
 *                   example: "Statue of Liberty"
 *                 location:
 *                   type: string
 *                   example: "New York"
 *       400:
 *         description: Bad request - missing or invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields: name, location"
 *       415:
 *         description: Unsupported media type - Content-Type must be application/json.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unsupported Media Type. Content-Type must be application/json"
 */


// Define PUT endpoint for updating or creating a place
app.put('/places/:place_id', (req, res) => {
  const placeId = req.params.place_id;
  const { name, location } = req.body;

  // Validate Content-Type header
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(415).json({ error: "Unsupported Media Type. Content-Type must be application/json" });
  }

  // Validate required fields
  if (!name || !location) {
    return res.status(400).json({ error: "Missing required fields: name, location" });
  }

  const existingPlaceIndex = places.findIndex(place => place.id === placeId);

  if (existingPlaceIndex !== -1) {
    // Update existing place
    places[existingPlaceIndex] = { id: placeId, name, location };
    return res.status(200).json(places[existingPlaceIndex]);
  } else {
    // Create a new place if it doesn't exist
    const newPlace = { id: placeId, name, location };
    places.push(newPlace);
    return res.status(201).json(newPlace);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


module.exports = app;