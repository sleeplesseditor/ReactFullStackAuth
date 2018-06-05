const { APP_SECRET } = require('./secrets');
const uuid = require('uuid/v4');
const SHA256 = require('crypto-js/sha256');

const hash = str => {
    return SHA256(`${APP_SECRET}${str}${APP_SECRET}`).toString();
};

class Session {
    constructor(username) {
        this.username = username;
        this.id = uuid();
    }

    toString() {
        return Session.dataToString(this.username, this.id);
    }

    static userData(username, id) {
        return `${username}|${id}`;
    }

    static dataToString(username, id) {
        const user_data = Session.userData(username, id);
        return `${user_data}|${hash(user_data)}`;
    }
}

module.exports = { hash, Session };