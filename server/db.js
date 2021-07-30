const spicedPg = require("spiced-pg");
const { hashPassword } = require("./hash");

const { username, password } =
    process.env.SESSION_SECRET ||
    require("../secrets").SESSION_SECRET ||
    require("../secrets.json");

const databaseName = "triproutes";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${username}:${password}@localhost:5432/${databaseName}`
);

function createUser({
    firstName,
    lastName,
    profile_url,
    bio,
    email,
    password,
}) {
    return hashPassword(password).then((password_hash) => {
        console.log(
            "db.js",
            firstName,
            lastName,
            profile_url,
            bio,
            email,
            password_hash
        );
        return db
            .query(
                `INSERT INTO users (first_name, last_name,  profile_url, bio, email, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [
                    firstName,
                    lastName,
                    profile_url,
                    bio || null,
                    email,
                    password_hash,
                ]
            )
            .then((result) => {
                console.log("db.js createUsers", result.rows[0]);
                return result.rows[0];
            });
    });
}

function getUserByEmail(email) {
    return db
        .query("SELECT * FROM users WHERE email = $1", [email])
        .then((foundUser) => {
            if (!foundUser) {
                return;
            }
            return foundUser.rows[0];
        });
}

function insertBio(bio, userId) {
    return db
        .query(`UPDATE users SET bio=$1 WHERE id=$2 RETURNING *`, [bio, userId])
        .then((result) => {
            return result.rows[0];
        });
}

function createTrip(userId, tripName, tripType, coordinates) {
    console.log("db.js", tripName, coordinates);
    return db
        .query(
            `INSERT INTO trips (userId, tripName, tripType, coords) VALUES (
                $1,
                $2,
                $3,
                $4) RETURNING *`,
            [userId, tripName, tripType, coordinates]
        )
        .then((results) => {
            console.log("db.js geometry", results.rows[0]);
            return results.rows[0];
        })
        .catch((error) => {
            console.log(error);
        });
}

function getTrips() {
    return db.query(`SELECT * FROM trips`).then((result) => {
        console.log("db.js getTrips", result.rows[0]);
        return result.rows;
    });
}

module.exports = {
    createUser,
    getUserByEmail,
    insertBio,
    createTrip,
    getTrips,
};
