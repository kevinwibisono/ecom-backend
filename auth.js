const jwt = require("jsonwebtoken");

function authToken(token) {
    let result = {};
    result.status = 401;
    let user = {};
    if(!token) {
        result.msg = "token not found";
    }
    else {
        try {
            user = jwt.verify(token,"proyekSOA");
            if((new Date().getTime() / 1000) - user.iat > 3600) {
                result.msg = "Token Expired.";
            }
            else {
                result.status = 200;
                result.user = user;
            }
        } catch (error) {
            result.status = 400;
            result.msg = "Invalid Token!";
            result.error = error;
        }
    }
    return result;
}

module.exports = {
    "authToken":authToken
};