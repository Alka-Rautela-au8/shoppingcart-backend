import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    cartId:{
        type: String
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    items: {
        type: Array,
    },
    totalPrice:{
        type: Number,
        default: 0
    },
    totalQuantity:{
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model("Cart", CartSchema)

