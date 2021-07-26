const { genSalt, hash } = require("bcryptjs");

function hashPassword(password) {
    return genSalt().then((salt) => {
        return hash(password, salt);
    });
}

module.exports = { hashPassword };
