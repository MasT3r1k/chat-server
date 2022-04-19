const db = require('../db');
const crypto = require('crypto');
const language = require('./language');

module.exports.isLogged = (req) => {
    return req.session.user ? true : false;
}

module.exports.encodePass = (pwd) => {
    if (pwd)
    {
        let randomstring = (Math.random() + 1).toString(36).substring(2);
        return `sha256$${randomstring}$${crypto.createHash('sha256').update(crypto.createHash('sha256').update(pwd).digest('hex') + randomstring).digest('hex')}`;
    }
}

module.exports.samePassword = (pwd, hash) => {
    let tmp = hash.split('$');
    return crypto.createHash('sha256').update(crypto.createHash('sha256').update(pwd).digest('hex') + tmp[1]).digest('hex') === tmp[2];
};

// module export function for Authenticator register
module.exports.register = (user, pass, email, phone, callback) => {

    // check if password is less than 6 characters and greater than 20 characters
    if (pass.length < 6) return callback('password_must_be_longer');

    // check if email is valid
    if (email != null && !email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) return callback('invalid_email');

    // check if phone is valid
    if (phone != null && !phone.match(/^[0-9]{10}$/)) return callback('invalid_phone');

    if (phone == null && email == null) return callback('register_error');

    // check if user is more than 20 characters
    if (user.length < 3 ) return callback('username_must_be_longer');
    if (user.length > 20) return callback('username_must_be_shorter');

    

    // return callback
    return callback(null);

};

module.exports.login = (user, pass, callback) => {

    // check if user is email or phone
    let isEmail = user.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
    let isPhone = user.match(/^[0-9]{10}$/);
    let user_type = null;
    if (isEmail || isPhone) user_type = isPhone ? "phone" : "email";
    if (user_type === null) return callback('login_invalid_email_or_phone', null);

        db.query(`SELECT * FROM users WHERE ${user_type} = ? LIMIT 1`, [user], (err, result) => {
            if (err) console.log(err)
            if (result.length > 0)
            {
                // check if password is correct
                if (this.samePassword(pass, result[0].password)) {
                    // create session
                    req.session.user = result[0];
                    return callback(null, result[0]);
                } else {
                    return callback('login_wrong_password', null);
                }
            } else {
                return callback('no_user_found', null);
            }
        });
    
    };