const { compare } = require("bcryptjs");
const { getUserByEmail } = require("./db.js");

function login(email, password) {
    return getUserByEmail(email).then((foundUser) => {
        console.log("login.js: found user", foundUser);
        if (!foundUser) {
            console.log("login.js NO USER FOUND");
            return null;
        }

        return compare(password, foundUser.password_hash).then((foundUser) => {
            if (foundUser) {
                console.log("Its a match");
                return foundUser;
            }
            return null;
        });
    });
}

module.exports = {
    login,
};
