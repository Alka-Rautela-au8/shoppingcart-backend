import crypto from 'crypto';
import ErrorResponse from '../utils/errorResponse';
import User from '../models/User';
import Wishlist from '../models/Wishlist';
import sendEmail from '../utils/sendEmail';

// @desc         Register User
// @route        POST /api/v1/auth/register
// @access       Public
exports.register = async(req, res, next) => {
    const {name, email, password, role} = req.body;

    if(!name || !email || !password){
        return (next(new ErrorResponse('please add all required fields', 400)))
    }

    // Create User
    try{
        const user = await User.create({
            name,
            email,
            password,
            role
        })

        // Get verification token
        const verificationToken = user.getVerificationToken();

        await user.save({validateBeforeSave: false});
    
        // Create verification url
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify/${verificationToken}`;
    
        // FIXME:
        // do this using frontend (not like this)
        const message = `please verify your account by sending put request: \n \n ${verificationUrl}`;

        // html message (optional)
        const html = `please verify your account by sending put request: \n \n ${verificationUrl}
        <button><a href="#" >Verify</a></button>`


        await sendEmail({
            email: user.email,
            subject: 'Verify Account',
            message,
            html
        })

        sendTokenResponse(user, 200, res);

    }catch(err){
        console.log(err);
        user.verificationToken = undefined;
        user.verificationExpire = undefined;

        await user.save({validateBeforeSave: false})
        return next(err)
    }
    
}

// @desc         send user verification email to user
// @route        PUT /api/v1/auth/verifyToken
// @access       Private
exports.sendVerificationEmail = async(req, res, next) => {
    try{
        const user = await User.findById(req.user.id)
        if(user.verified){
            return res.status(200).json({success: true, message: 'User has already been verified!'})
        }

        // Get verification token
        const verificationToken = user.getVerificationToken();

        await user.save({validateBeforeSave: false});

        // Create verification url
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify/${verificationToken}`;

        // FIXME:
        // do this using frontend (not like this)
        const message = `please verify your account by sending put request: \n \n ${verificationUrl}`;

        // html message (optional)
        const html = `please verify your account by sending put request: \n \n ${verificationUrl}
        <button><a href="#" >Verify</a></button>`

        await sendEmail({
            email: user.email,
            subject: 'Verify Account',
            message,
            html
        })

        res.status(200).json({
            success: true,
            message: 'verification email sent, please check your email!'
        })

    }catch(err){
        console.log(err);
        user.verificationToken = undefined;
        user.verificationExpire = undefined;

        await user.save({validateBeforeSave: false})
        return next(err)
    }
}

// @desc         Verify Email User
// @route        PUT /api/v1/auth/verify/:verificationtoken
// @access       Private
exports.verifyUser = async(req, res, next) => {
    try{

        const verificationToken = crypto
            .createHash('sha256')
            .update(req.params.verificationtoken)
            .digest('hex');

        const user = await User.findOne({
            verificationToken,
            verificationExpire: {$gt: Date.now()}
        });

        if(!user){
            return next(new ErrorResponse(`invalid token`, 400))
        }

        // set new password
        user.verified = true;
        user.verificationToken = undefined;
        user.verificationExpire = undefined;

        await user.save();

        // when user gets verified then a wishlist for that user gets created only if user is not 'seller'
        if(user.role !== 'seller'){
            const wishlist = {
                user: req.user.id
            }
    
            await Wishlist.create(wishlist);
        }
        sendTokenResponse(user, 200, res);
    }catch(err){
        next(err)
    }
}


// @desc         Login User
// @route        POST /api/v1/auth/login
// @access       Public
exports.login = async(req, res, next) => {
    const {email, password} = req.body;

    // Validate email and password
    if(!email || !password){
        return next(new ErrorResponse('Please provide an email and password', 400))
    }

    try{
        // check for user
        const user = await User.findOne({email}).select('+password'); // also selecting password of given user from db

        if(!user){
            return next(new ErrorResponse('Invalid Email', 401))
        }

        // if email exits then check if password matches or not
        const isMatch = await user.matchPassword(password);

        if(!isMatch){
            return next(new ErrorResponse('Invalid Password', 401))
        }

        sendTokenResponse(user, 200, res)
    }catch(err){
        next(err)
    }
}


// @desc         LOG user OUT / clear cookie
// @route        GET /api/v1/auth/logout
// @access       Private
exports.logout = async(req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        data: {}
    })
}

// @desc         Get current Logged in User
// @route        POST /api/v1/auth/me
// @access       Private
exports.getMe = async(req, res, next) => {
    try{
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        })
    }catch(err){
        next(err);
    }
}

// @desc         Update user details 
// @route        PUT /api/v1/auth/updatedetails
// @access       Private
exports.updateDetails = async(req, res, next) => {
    const fieldToUpdate = {}

    if(req.body.name){
        fieldToUpdate['name'] =  req.body.name
    }

    if(req.body.email){
        fieldToUpdate['email'] = req.body.email
    }

    try{
        const user = await User.findByIdAndUpdate(req.user.id, fieldToUpdate, {
            new: true,
            runValidators: true
        });
    
        res.status(200).json({
            success: true,
            data: user
        })
    }catch(err){
        next(err)
    }
}

// @desc         Update password
// @route        PUT /api/v1/auth/updatepassword
// @access       Private
exports.updatePassword = async(req, res, next) => {
    try{
        const user = await User.findById(req.user.id).select('+password');

        // check current password is right or not
        if(!(await user.matchPassword(req.body.currentPassword))){
            return next(new ErrorResponse(`password is incorrect`, 401))
        }

        user.password = req.body.newPassword;

        await user.save();

        sendTokenResponse(user, 200, res)
    }catch(err){
        next(err)
    }
    
}

// @desc         forgot password
// @route        PUT /api/v1/auth/forgotpassword
// @access       Public
exports.forgotPassword = async(req, res, next) => {
    try{
        const user = await User.findOne({email: req.body.email});

        if(!user){
            return next(new ErrorResponse('there is no user with this email', 404));
        }
    
        // Get reset token
        const resetToken = user.getResetPasswordToken();
    
        await user.save({validateBeforeSave: false});
    
        // Create reset url
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    
        // FIXME:
        // do this using frontend (not like this)
        const message = `You are receiving this email because you have requested the reset of a password. 
        Please make a PUT request to : \n \n ${resetUrl}`;

        // html message (optional)
        const html = `You are receiving this email because you have requested the reset of a password. 
        Please make a PUT request to : \n \n ${resetUrl}
        <button><a href="#" >Reset</a></button>`


        await sendEmail({
            email: user.email,
            subject: 'password reset token',
            message,
            html
        })

        res.status(200).json({success: true, data: 'Email sent'});
    }catch(err){

        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false})

        return next(new ErrorResponse('Email could not be send', 500))
    }
}

// @desc         reset password
// @route        PUT /api/v1/auth/resetpassword/:resettoken
// @access       Public
exports.resetPassword = async(req, res, next) => {
    try{
        // Get hashed token 
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()}
        });

        if(!user){
            return next(new ErrorResponse(`invalid token`, 400))
        }

        // set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendTokenResponse(user, 200, res);
    }catch(err){
        next(err)
    }
}

// Get token from model, create cookie and sed response
const sendTokenResponse = (user, statusCode, res) => {

    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    // secure flag for production mode
    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
}

