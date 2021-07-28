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
const geometries = require("./geometries.json");

//for resetting password
const cryptoRandomString = require("crypto-random-string");

const { createUser, getUserByEmail, getGeometries } = require("./db");
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
    response.json({ user: request.session.user });
});

app.get("/api/geom", (request, response) => {
    // console.log("GEOMETRIES", geometries);
    getGeometries(1).then((result) => {
        console.log("server.js API/GEOM", result);
    });
    response.json("ok");
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
    const profile_url = "/assets/defaultImage.jpg";
    const { firstName, lastName, email, password } = request.body;
    console.log("server request.body", request.body);
    console.log("server request.session", request.session);

    createUser({ firstName, lastName, profile_url, email, password })
        .then((user) => {
            console.log("server, user", user);
            request.session.userId = user.id;
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
