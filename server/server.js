const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
    allowrequest: (request, callback) =>
        callback(
            null,
            request.headers.refer.startsWith("http://localhost:3000")
        ),
});
const compression = require("compression");
const cookieSession = require("cookie-session");
const path = require("path");
const csurf = require("csurf");
const points = require("./geometries/points.json");
const linestring = require("./geometries/linestring.json");

//for resetting password
const cryptoRandomString = require("crypto-random-string");

const {
    createUser,
    getUserByEmail,
    createTrip,
    getTrips,
    insertBio,
    getAllUsers,
} = require("./db");
const { login } = require("./login");

app.use(compression());
app.use(express.json());

const cookieSessionMiddleware = cookieSession({
    secret: "My secret",
    maxAge: 24 * 60 * 60 * 1000 * 20,
});
app.use(cookieSessionMiddleware);

io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

app.use(csurf());
app.use((request, response, next) => {
    response.cookie("myToken", request.csrfToken());
    next();
});

app.use(express.static(path.join(__dirname, "..", "client", "public")));

app.get("/api/user/id", (request, response) => {
    if (!request.session.user) {
        response.json({ user: request.session.user });
        return;
    }
    getUserByEmail(request.session.user.email).then((user) => {
        response.json({ user: user });
    });
});

app.post("/api/user/id", (request, response) => {
    const userId = request.session.user.id;
    const { bio } = request.body;
    console.log("request-body", request.body);
    insertBio(bio, userId).then((result) => {
        console.log("insertBio result", result);
        const updatedUser = result;
        console.log("updatedUser", updatedUser);
        response.json({ user: updatedUser });
    });
});

app.get("/api/users", (request, response) => {
    getAllUsers().then((result) => {
        console.log("server.js users", result);
        response.json(result);
    });
});

app.get("/api/geom", (request, response) => {
    getTrips().then((result) => {
        console.log("server.js getTrips", result);
        response.json(result);
    });
});

app.post("/api/geom", (request, response) => {
    const userId = request.session.user.id;
    const { tripName, tripType, coordinates } = request.body;

    createTrip(userId, tripName, tripType, coordinates)
        .then((result) => {
            console.log("server.js insert Geometry", result);
            response.json(result);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.post("/api/login", (request, response) => {
    const { email, password } = request.body;
    login(email, password)
        .then((foundUser) => {
            if (!foundUser) {
                console.log("NO FOUND USER");
                return;
            }
            getUserByEmail(request.body.email).then((user) => {
                request.session.user = user;
                response.json(user);
                return;
            });
        })
        .catch((error) => {
            response.status(400);
            response.json(error);
        });
});

app.post("/api/logout", (request, response) => {
    request.session.user = null;
    response.json({ message: "Logged out!" });
});

app.post("/api/registration", (request, response) => {
    const profile_url = "../assets/defaultImage.jpg";
    const { firstName, lastName, email, password } = request.body;
    console.log("server request.body", request.body);
    console.log("server request.session", request.session);

    createUser({ firstName, lastName, profile_url, email, password })
        .then((user) => {
            console.log("server, user", user);
            request.session.user = user;
            response.json(user);
        })
        .catch((error) => {
            console.log("createUserErrr", error);
            response.status(400);
            response.json(error);
        });
});

app.get("*", function (request, response) {
    console.log("server.js RESPONSE !");
    response.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

server.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
