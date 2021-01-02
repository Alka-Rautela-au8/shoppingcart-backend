import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name:{
        type: String,
        unique: true,
        required: [true, 'Please add category name'],
    }
});

module.exports = mongoose.model('Category', CategorySchema);