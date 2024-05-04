const jwt = require('jsonwebtoken')

const auth = async (req, res, next) =>{
    try{
        let token = await req.cookies.jwt

        let verifyToken = await jwt.verify(token, process.env.SECRET_KEY)

        req._id = verifyToken._id;

        next()
    }
    catch(err){
        console.log(err)
        res.redirect('/login')
    }
}

module.exports = auth