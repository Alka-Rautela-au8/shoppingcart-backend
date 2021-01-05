import crypto from 'crypto'; // core module
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please add a name']
    },
    email:{
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match:[
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 
            'Please add a valid email'
        ]
    },
    role:{
        type: String,
        enum: ['user', 'seller'],
        default: 'user'
    },
    password:{
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt:{
        type: Date,
        default: Date.now
    },
    verified:{
        type: Boolean,
        default: false
    }
})

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next){

    // move forward if password is actually modified
    if(!this.isModified('password')){
        next();
    }

    const salt = await bcrypt.genSalt(10);  // genSalt method takes number of rounds >> higher the round == more secure password  BUT heavier it is on our system, so 10 is the recommended  
    this.password = await bcrypt.hash(this.password, salt);
});

// creating a method 
// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })  // sign takes payload. here we are setting id as payload 

}

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// Generate and Hash password token
UserSchema.methods.getResetPasswordToken = function(){
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex'); 

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest("hex")
    
    // set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;

}
module.exports = mongoose.model('User', UserSchema)