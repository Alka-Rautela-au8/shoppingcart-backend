import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref : 'User', 
        required: true
    },
    items: {
        type: Array
    }
})

module.exports = mongoose.model("Wishlist", WishlistSchema)