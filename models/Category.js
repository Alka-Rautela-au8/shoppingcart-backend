import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name:{
        type: String,
        unique: true,
        required: [true, 'Please add category name'],
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Cascade delete offer when category is deleted
CategorySchema.pre('remove', async function(next){
    console.log(`Offer being removed from Category ${this._id}`)
    await this.model('Offer').deleteOne({category: this._id}) // only if one offer per category else use deleteMany
    next() 
})


// Reverse populate with virtuals
// here name can be anything like 'offers'
CategorySchema.virtual('offers', {
    ref: 'Offer',
    localField: '_id',
    foreignField: 'category',
    justOne: true
})

module.exports = mongoose.model('Category', CategorySchema);