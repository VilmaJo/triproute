const spicedPg = require("spiced-pg");
const { hashPassword } = require("./hash");

const { username, password } =
    process.env.SESSION_SECRET ||
    require("../secrets").SESSION_SECRET ||
    require("../secrets.json");

const databaseName = "socialnetwork";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${username}:${password}@localhost:5432/${databaseName}`
);

function createUsers({
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
                return result.rows;
            });
    });
}

module.exports = {
    createUsers,
};
