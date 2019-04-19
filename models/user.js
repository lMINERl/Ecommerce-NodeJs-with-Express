const mongoose = require('mongoose'); // database communication
const bcrypt = require('bcrypt'); // for hashing functions
const jwt = require('jsonwebtoken'); // tokens
// const {promisify}  = require('util'); // for turning call back to promise because jwt doesnt support promisises
const saltRounds = process.env.SALT_ROUND || 10; //increasing the complexty of hashing
const secretKey = process.env.SECRET_KEY || 'mySecretKey';  // secret key for token validation (salted hashing)
const tokenExpire = process.env.TOKEN_EXPIRE || '1h';
const createError = require('http-errors');
// const promisify = async (func) => {
//     return new Promise((res, rej) => { func });
// }


// const promisify = async (func) => {
//     return new Promise((res, rej) => { func });
// }

// const sing2 = Promise.promisify(jwt.sign,{context:jwt});
// const sign = promisify(jwt.sign);
// const sign = (obj) => { return new Promise((ac, rej) => jwt.sign(obj)) };
// const verfiy = () => { return new Promise(jwt.verify) };
// const verfiy = promisify(jwt.verifiy);

// adding new schema to database
const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        },

    },
    password: {
        type: String,
        required: true,
    },
},
    {
        toJSON: {
            hidden: ['password', '__v'], //to hide the password and other values from response
            transform: true,
        },
        autoIndex: true
    }
);

// apply the transform hide
schema.options.toJSON.transform = function (doc, ret, options) {
    try {
        if (Array.isArray(options.hidden)) {
            options.hidden.forEach((prop) => { delete ret[prop]; });
        }
    } catch (err) {
        createError(err);
    }
    return ret;
}
const hashPassword = password => bcrypt.hash(password, saltRounds); // apply the hash to the given password using bcrypt.hash

// life cycle hook before saving the document in the database
schema.pre('save', async function () {
    const user = this;
    if (user.isNew || user.modifiedPaths().includes('password')) {
        user.password = await hashPassword(user.password)
    }
});

// adding for verifyPassword and adding it in prototype in the model user
schema.method('verifyPassword', function (comparePassword) {
    return bcrypt.compare(comparePassword, this.password); // to avoid timed attacks
});


schema.method('generateToken', async function () {
    let token;
    try {
        const user = this;
        // el promisify mosh sha3'alah
        await new Promise((r, rj) => { r(jwt.sign({ _id: user.id }, secretKey, { expiresIn: tokenExpire })) })
            .then((v) => { token = v });
        // token = await sign({ _id: user.id }, secretKey, { expiresIn: '5m' });
    } catch (err) {
        createError(err);
    }
    return token;
});

// static function in usermodel for decode token 
schema.static('decodeToken', async function (token) {
    let result;
    await new Promise((r, rj) => { r(jwt.verify(token, secretKey)) })
        .then((v) => {
            result = v;
        })
        .catch(createError);
    return result;
});

const User = mongoose.model('user', schema);
module.exports = User;
