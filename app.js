const express = require('express');
const app = express();
//app.use(requireHTTPS);
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');

// Load in the mongoose models
const { Room, Task, User } = require('./db/models');

//app.get('/*', function(req, res) {
//    res.sendFile('index.html', {root: __dirname + 'frontend/dist/frontend'}
//  );
//  });

/* MIDDLEWARE */

// Load middleware
app.use(bodyParser.json());

// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/frontend/dist/frontend'));

app.get('/*', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/frontend/dist/frontend/' }
    );
});

// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Content-Length, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

/* END MIDDLEWARE */

/* SWAGGER */

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "HotelCleaning API",
            version: "1.0.0",
            description: "HotelCleaning API"
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ]
    },
    apis: ["app.js"]
}

const specs = swaggerJsDoc(options);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

/**
 * @swagger
 * components:
 *  schemas:
 *      Room:
 *          type: object
 *          required:
 *            - title
 *          properties:
 *            _id:
 *              type: string
 *              description: The auto generated id of the room
 *            title:
 *              type: string
 *              description: The room name
 *            __v:
 *              type: integer
 *              description: internal revision of the document
 *          example:
 *            _id: 60c12bbd06be913814cda4a8
 *            title: Room101 
 *            __v: 0   
 *      Task:
 *          type: object
 *          required:
 *            - completed
 *            - title
 *          properties:
 *            completed:
 *              type: boolean
 *              description: Task is completed or not
 *            _id:
 *              type: string
 *              description: The auto generated id of the task
 *            title:
 *              type: string  
 *              description: The task description
 *            _roomId:
 *              type: string
 *              description: The auto generated id of the room
 *            __V:
 *              type: integer
 *              description: internal revision of the document
 *          example:
 *            completed: false
 *            _id: 60c12bfb06be913814cda4a9
 *            title: This is a new task list!
 *            _roomId: 60c12bbd06be913814cda4a8
 *            __v: 0
 *      User:
 *          type: object
 *          required:
 *            - email
 *            - password
 *          properties:         
 *            email:
 *              type: string
 *              description: User name
 *            password:
 *              type: string
 *              description: User password
 *          example:
 *            email: test@test.com
 *            password: helloworld
 *      AccessToken:
 *          type: object
 *          required:
 *            - accessToken
 *          properties:         
 *            accessToken:
 *              type: string
 *              description: access Token
 *          example:
 *            accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGMzODZlMmY0N2Q3ZDM4Mjg5OWI3MDUiLCJpYXQiOjE2MjM0MjgwNjgsImV4cCI6MTYyMzQyODk2OH0.blMVRACgO22kmYkqcB8TV7Y5ONSVChmfocIpLC_31DE
 */

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: The rooms managing API
 */

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: The tasks managing API
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The user managing API
 */

/* END SWAGGER */

/* ROUTE HANDLERS */

/* ROOM ROUTES */

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Returns the list of all the rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: The list of the rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 */

/**
 * GET /rooms
 * Purpose: Get all rooms
 */
app.get('/rooms', (req, res) => {
    // We want to return an array of all the rooms that belong to the authenticated user 
    Room.find({}).then((rooms) => {
        res.send(rooms);
    }).catch((e) => {
        res.send(e);
    });
})

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new Room
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       200:
 *         description: The room was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       500:
 *         description: Some server error
 */

/**
 * POST /rooms
 * Purpose: Create a room
 */
app.post('/rooms', (req, res) => {
    // We want to create a new room and return the new room document back to the user (which includes the id)
    // The room information (fields) will be passed in via the JSON request body
    let title = req.body.title;

    let newRoom = new Room({
        title
    });
    newRoom.save().then((roomDoc) => {
        // the full room document is returned (incl. id)
        res.send(roomDoc);
    })
});

/**
 * @swagger
 * /rooms/{id}:
 *   patch:
 *     summary: Update a Room
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The room id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       200:
 *         description: The room was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       500:
 *         description: Some server error
 */

/**
 * PATCH /rooms/:id
 * Purpose: Update a specified room
 */
app.patch('/rooms/:id', (req, res) => {
    // We want to update the specified room (room document with id in the URL) with the new values specified in the JSON body of the request
    Room.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.send({ 'message': 'updated successfully'});
    });
});

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a Room
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The room id
 *     responses:
 *       200:
 *         description: The room was successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       500:
 *         description: Some server error
 */

/**
 * DELETE /rooms/:id
 * Purpose: Delete a room
 */
app.delete('/rooms/:id', (req, res) => {
    // We want to delete the specified room (document with id in the URL)
    Room.findOneAndRemove({
        _id: req.params.id
    }).then((removedRoomDoc) => {
        res.send(removedRoomDoc);

        // delete all the tasks that are in the deleted room
        deleteTasksFromRoom(removedRoomDoc._id);
    })
});

/**
 * @swagger
 * /rooms/{roomId}/tasks:
 *   get:
 *     summary: Returns the list of all the tasks
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: The room id
 *     responses:
 *       200:
 *         description: The list of the tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: The room was not found
 */

/**
 * GET /rooms/:roomId/tasks
 * Purpose: Get all tasks in a specific room
 */
app.get('/rooms/:roomId/tasks', (req, res) => {
    // We want to return all tasks that belong to a specific room (specified by roomId)
    Task.find({
        _roomId: req.params.roomId
    }).then((tasks) => {
        res.send(tasks);
    })
});

/**
 * @swagger
 * /rooms/{roomId}/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: The room id  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: The task was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Some server error
 */

/**
 * POST /rooms/:roomId/tasks
 * Purpose: Create a new task in a specific room
 */
app.post('/rooms/:roomId/tasks', (req, res) => {
    // We want to create a new task in a room specified by roomId

    Room.findOne({
        _id: req.params.roomId
    }).then((room) => {
        if (room) {
            // room object with the specified conditions was found
            // therefore we can create new tasks
            return true;
        }

        // else - the room object is undefined
        return false;
    }).then((canCreateTask) => {
        if (canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _roomId: req.params.roomId
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            })
        } else {
            res.sendStatus(404);
        }
    })
})

/**
 * @swagger
 * /rooms/{roomId}/tasks/{taskId}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: The room id
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: The task was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       500:
 *         description: Some server error
 */

/**
 * PATCH /rooms/:roomId/tasks/:taskId
 * Purpose: Update an existing task
 */
app.patch('/rooms/:roomId/tasks/:taskId', (req, res) => {
    // We want to update an existing task (specified by taskId)

    Room.findOne({
        _id: req.params.roomId
    }).then((room) => {
        if (room) {
            // room object with the specified conditions was found
            // therefore we can make updates to tasks within this room
            return true;
        }

        // else - the room object is undefined
        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks) {
            // the currently authenticated user can update tasks
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _roomId: req.params.roomId
            }, {
                    $set: req.body
                }
            ).then(() => {
                res.send({ message: 'Updated successfully.' })
            })
        } else {
            res.sendStatus(404);
        }
    })
});

/**
 * @swagger
 * /rooms/{roomId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a Task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     responses:
 *       200:
 *         description: The task was successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Some server error
 */

/**
 * DELETE /rooms/:roomId/tasks/:taskId
 * Purpose: Delete a task
 */
app.delete('/rooms/:roomId/tasks/:taskId', (req, res) => {

    Room.findOne({
        _id: req.params.roomId,
    }).then((room) => {
        if (room) {
            // room object with the specified conditions was found
            // therefore the currently authenticated user can make updates to tasks within this room
            return true;
        }

        // else - the room object is undefined
        return false;
    }).then((canDeleteTasks) => {
        
        if (canDeleteTasks) {
            Task.findOneAndRemove({
                _id: req.params.taskId,
                _roomId: req.params.roomId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            })
        } else {
            res.sendStatus(404);
        }
    });
});


/* User Routes */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Some server error
 */

/**
 * POST /users
 * Purpose: Sign up
 */
app.post('/users', (req, res) => {
    // User sign up
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we generate an access auth token for the user
        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we retun an object containing the auth tokens
            return {accessToken, refreshToken}
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })

});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Some server error
 */

/**
 * POST /users/login
 * Purpose: Login
 */
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})

/**
 * @swagger
 * /users/me/access-token:
 *   get:
 *     summary: generates and returns an access token
 *     tags: [Users]
 *     parameters:
 *       - in: header
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *       - in: header
 *         name: x-refresh-token
 *         schema:
 *           type: string
 *         required: true
 *         description: an authorization header
 *     responses:
 *       200:
 *         description: new access token generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessToken'
 *       404:
 *         description: Some server error
 */

/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})


/* HELPER METHODS */
let deleteTasksFromRoom = (_roomId) => {
    Task.deleteMany({
        _roomId
    }).then(() => {
        console.log("Tasks from " + _roomId + " were deleted!");
    })
}

const port = process.env.PORT || 8080;
//const port = 3000;
app.listen(port, () => {
    console.log("Server is listening to port 3000");
})