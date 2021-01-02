import mongoose from 'mongoose';

// const connectDB = async() => {
//     const conn = await mongoose.conne
// }

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }).then(response => {
        console.log(`MongoDB connected: ${response.connection.host}`)
    }).catch(err => console.log(err.message)) 
}

module.exports = connectDB