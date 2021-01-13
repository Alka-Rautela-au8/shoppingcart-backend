import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    category:{
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    percentage:{
        type: Number,
        required: true,
    }
})

// prevent admin from adding more than one offer per Category or product
OfferSchema.index({category: 1, product: 1}, {unique: true});

module.exports = mongoose.model("Offer", OfferSchema)