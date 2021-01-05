import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';

import errorHandler from './middleware/error';
import connectDB from './config/db';


// Load env variables
dotenv.config({path : './config/config.env'})

// connect to database
connectDB();


// Initialize app 
const app = express();

// import Route files
import category from './routes/category';
import users from './routes/users';
import auth from './routes/auth';
import product from './routes/product';


/* apply express body parser for parsing information contained in post request
json parses application/json request bodies */
app.use(express.json())

// Cookie Parser
app.use(cookieParser())

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// file uploading
app.use(fileUpload({
    useTempFiles: true //storing file in temp folder
}));

// enable cors
app.use(cors())

// Health check
app.get('/', (req, res) => {
    res.status(200).send('Health Ok!')
})

// Mount routers
app.use('/api/v1/category', category)
app.use('/api/v1/users', users)
app.use('/api/v1/auth', auth)
app.use('/api/v1/products', product)

//this middleware have to below router , else it will not catch the error
app.use(errorHandler);


const PORT = process.env.PORT || 2400;

const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)

// global handler for unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);

    // Close server and exit process
    server.close(() => {
        process.exit(1)
    })
})