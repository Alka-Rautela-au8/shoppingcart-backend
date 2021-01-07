import ErrorResponse from '../utils/errorResponse';

const errorHandler = (err, req, res, next) => {
    let error  = {...err}

    error.message = err.message;
    error.name= err.name;

    console.log('from errorHandler ---> ', err.name);

    if(error.name === 'CastError'){
        const message = 'Resource not found'
        error = new ErrorResponse(message, 404)
    }

    // Mongoose Duplicate key
    if(error.code === 11000){
        let message= `${Object.keys(err.keyValue)} is already in use`
        error = new ErrorResponse(message, 400)
    }

    // Mongoose Validation Error
    if(error.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400)
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    })
}

module.exports = errorHandler;