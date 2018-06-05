const { Router } = require('express');
const pool = require('./db');
const { hash, Session } = require('./helper');

const router = new Router();

//Get details from database file
router.get('/all', (req, res, next) => {
    pool.query('SELECT * FROM users', (q_err, q_res) => {
        if (q_err) return next(q_err);

        res.json(q_res.rows);
    });
});

const set_session_cookie = (session_str, res) => {
    res.cookie('session_str', session_str, {
        expire: Date.now() + 3600000,
        httpOnly: true
        //Use with https for secure cookie
        // secure: true
    });
}

const set_session = (username, res, session_id) => {
    let session, session_str;

    if (session_id) {
        session_str = Session.dataToString(username, session_id);
    } else {
        session = new Session(username);
        session_str = session.toString();
    }
    
    return new Promise((resolve, reject) => {
        if (session_id) {
            set_session_cookie(session_str, res);
            resolve();
        } else {
            pool.query(
                'UPDATE users SET session_id = $1 WHERE username_hash = $2',
                [session.id, hash(username)],
                (q_err, q_res) => {
                    if (q_err) return reject(q_err);
                    set_session_cookie(session_str, res);
                    resolve();
                }
            );
        }
    });
};

router.post('/new', (req, res, next) => {
    const { username, password } = req.body;
    const username_hash = hash(username);

    pool.query(
        'SELECT * FROM users WHERE username_hash = $1', 
        [username_hash],
        (q0_err, q0_res) => {
            if (q0_err) return next(q0_err);

            if (q0_res.rows.length === 0) {
                //Insert new user
                pool.query(
                    'INSERT INTO users(username_hash, password_hash) VALUES($1, $2)',
                    [username_hash, hash(password)],
                    (q1_err, q1_res) => {
                        if (q1_err) return next(q1_err);
                        
                        set_session(username, res)
                            .then(() => {
                                res.json({ msg: 'Successfully created user' });
                            })
                            .catch(error => next(error));
                    }
                )
            } else {
                res.status(409).json({ 
                    type: 'error',
                    msg: 'This username has been taken'
                });
            }
        }
    )
});

router.post('/login', (req, res, next) => {
    const { username, password } = req.body;

    pool.query(
        'SELECT * FROM users WHERE username_hash = $1',
        [hash(username)],
        (q_err, q_res) => {
            if (q_err) return next(q_err);

            const user = q_res.rows[0];

            if (user && user.password_hash === hash(password)) {
                set_session(username, res, user.session_id)
                    .then(() => {
                        res.json({ msg: 'Successful login!' });
                    })
                    .catch(error => next(error));
            } else {
                res.status(400).json({ type: 'error', msg: 'Incorrect username/password' });
            }
        } 
    );
});

//Logout function
router.get('/logout', (req, res, next) => {
    const { username, id } = Session.parse(req.cookies.session_str);

    pool.query(
        'UPDATE users SET session_id = NULL WHERE username_hash = $1',
        [hash(username)],
        (q_err, q_res) => {
            if (q_err) return next(q_err);

            res.clearCookie('session_str');

            res.json({ msg: 'Successful logout' });
        }
    )
});

module.exports = router;