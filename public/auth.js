module.exports.registerUser = (username, email, password, password2, birthday, done) => {

    if (password !== password2) {
        return done('Password and confirm password are not same');
    }

    if (password.length < 6) {
        return done('Password must be at least 6 characters');
    }

    if (!email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
        return done('Email is not valid');
    }

    if (!birthday.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
        return done('Birthday is not valid');
    }

    if (!username.match(/^[a-zA-Z ]{2,30}$/)) {
        return done('Username is not valid');
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            return done(err);
        }

        if (result.length > 0) {
            return done('User already exists');
        }

        db.query("SELECT tag FROM users WHERE username = ?", [username], (err, result) => {
            if (err) {
                return done(err);
            }

            if (result.length > 0) {
                return done('Username already exists');
            }

            let tag = null;

            do {
                let tempTag = Math.floor(1000 + Math.random() * 9000);
                db.query("SELECT tag FROM users WHERE tag = ? AND username = ?", [tempTag, username], (err, result) => {
                    if (result.length == 0) {
                        tag = tempTag;
                    }
                });
                
            } while (!tag);

            const hash = bcrypt.hashSync(password, 10);

            db.query("INSERT INTO users (username, tag, email, password, birthday) VALUES (?, ?, ?, ?, ?)", [username, tag, email, hash, birthday], (err, result) => {
                if (err) {
                    return done(err);
                }

                return done(null);
            });
        });
    });

};