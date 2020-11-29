const jwt = require("jsonwebtoken");

async function authToken(token) {
    let result = {};
    result.status = 401;
    let user = {};
    if(!token) {
        result.msg = "token not found";
    }
    else {
        try {
            user = jwt.verify(token,"proyekecom");
            // if((new Date().getTime() / 1000) - user.iat > 3600) {
            //     result.msg = "Token Expired.";
            // }
            // else {
                result.status = 200;
                result.user = user;
            // }
        } catch (error) {
            result.status = 401;
            result.msg = "Invalid Token!";
            result.error = error;
            result.token = token;
        }
    }
    return result;
}
async function createToken(email, id_user, tipe_user, bio) {
    return jwt.sign({    
        "email":email,
        "id_user":id_user,
        "tipe_user":tipe_user,
        "bio":bio,
    },"proyekecom");
}

module.exports = {
    authToken,
    createToken
};