import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/errorResponse';
import User from '../models/User';

// Protect Routes
exports.protect = async(req, res, next) => {
    let token;
    console.log("header-->",req.header.authorization)
    console.log("cookies --->", req.cookies)

    // if token is sent in header
    if(
        req.header.authorization &&
        req.header.authorization.startsWith('Bearer')
    ){
        // Set token from bearer token in header
        token = req.headers.authorization.split(" ")[1];
    }
    
    // if token is sent in cookie
    else if(req.cookies.token){
        token = req.cookies.token
    }

    if(!token){
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try{
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        console.log(decoded);

        // here only we are setting req.user :)
        req.user = await User.findById(decoded.id);

        next();
    }catch(err){
        return next(new ErrorResponse('not authorized to access this route', 401));
    }
}

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 401))
        }
        next();
    }
}