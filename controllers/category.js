import ErrorResponse from '../utils/errorResponse'; 
import Category from '../models/Category';


// @desc         Get all categories
// @route        GET /api/v1/category
// @access       Public
exports.getCategory = async(req, res, next) => {
    try{
        res.status(200).json(res.advancedResults);
    }catch(err){
        // res.status(400).json({ success: false })
        next(err);
    }
}



// @desc         Get Single category
// @route        GET /api/v1/category/:id
// @access       Public
exports.getSingleCategory = async(req, res, next) => {
    try{
        const category = await Category.findById(req.params.id).populate('offers');

        if(!category){
            return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)) // will fire if category not found
        }

        res.status(200).json({ success: true, data: category })
    }catch(err){
        return next(new ErrorResponse(`category not found with id of ${req.params.id}`, 404)) // will fire if id is not formatted
        // next(err)
    }
}


// @desc         create a category
// @route        POST /api/v1/category
// @access       Private
exports.createCategory = async(req, res, next) => {
    try{
        const category = await Category.create(req.body)
        
        res.status(201).json({
            success: true,
            data: category
        })
    }catch(err){
        next(err)
    }
}


// @desc         update a category
// @route        PUT /api/v1/category/:id
// @access       Private
exports.updateCategory = async(req, res, next) => {
    try{
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!category){
            return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)) // will fire if category not found
        }

        res.status(200).json({ success: true, data: category })
    }catch(err){
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 403)) // will fire if id is not formatted
    }
}


// @desc         delete a category
// @route        DELETE /api/v1/category/:id
// @access       Private
exports.deleteCategory = async(req, res, next) => {
    try{
        const category = await Category.findById(req.params.id);

        if(!category){
            return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)) // will fire if category not found
        }

        category.remove();

        res.status(200).json({ success: true, data: {} })
    }catch(err){
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 403)) // will fire if id is not formatted
    }
}