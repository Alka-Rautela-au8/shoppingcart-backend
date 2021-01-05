import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, 'Please add a name'],
        unique: true, 
        trim: true, 
        maxlength: [150, 'Name cannot be more than 150 characters']
    },
    category:{
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    about: {
        type: String, 
        required: [true, 'Please add an about'],
    },
    website:{
        type: String,
        match:[
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 
            'Please use a valid URL with HTTP or HTTPS'
        ]
    }, 
    video:{type: String}, 
    cost:{
        type: Number,
        required: [true, 'Please add a cost']
    }, 
    quantity:{
        type: Number,
        required: [true, 'Please add total quantity']
    }, 
    email:{
        type: String,
        match:[
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 
            'Please add a valid email'
        ]
    },
    address:{
        type: String
    },
    averageRating:{
        type: Number, 
        min:[1, 'Rating must be at least 1'],
        max:[10, 'Rating cannot be more than 10'],
    },
    averageCost: Number,
    image:{
        //Array of strings
        type: Array
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    user:{
        type: mongoose.Schema.ObjectId,   //only user of this id can edit this product info
        ref: 'User',
        required: true
    },
    cloudinaryId : {
        type: String
    }
});

module.exports = mongoose.model("Product", ProductSchema);