import ErrorResponse from '../utils/errorResponse';
import Offer from '../models/Offer';
import Category from '../models/Category';

// @desc         Get all Offers
// @route        GET /api/v1/offers
// @access       Public
exports.getOffer = async(req, res, next) => {
    try{
        res.status(200).json(res.advancedResults);
    }catch(err){
        next(err);
    }
}

// @desc         Get Single Offer
// @route        GET /api/v1/offers/:id
// @access       Public
exports.getSingleOffer = async(req, res, next) => {
    try{
        const offer = await Offer.findById(req.params.id).populate({
            path: 'category',
            select: 'name'
        });

        if(!offer){
            return next(new ErrorResponse(`Offer not found with id ${req.params.id}`, 404))
        }

        res.status(200).json({
            success: true,
            data: offer
        })
    }catch(err){
        return next(new ErrorResponse(`offer not found with id of ${req.params.id}`, 404))
    }
}

// creating offer for a category 
// @desc         create an offer
// @route        POST /api/v1/offers
// @access       Private
exports.createOffer = async(req, res, next) => {
    try{
        const category = await Category.findById(req.body.category)

        if(!category){
            return next(new ErrorResponse(`No category with id of ${req.body.category}`))
        }

        const offer = await Offer.create(req.body);

        res.status(201).json({
            success: true,
            data: offer
        })
    }catch(err){
        // return next(new ErrorResponse(`No category with id of ${req.body.category}`))
        next(err)
    }
}

// @desc         update an offer
// @route        PUT /api/v1/offers/:id
// @access       Private
exports.updateOffer = async(req, res, next) => {
    try{
        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidator: true
        });

        if(!offer){
            return next(new ErrorResponse(`No product with the id ${req.params.id}`, 404));
        }
        
        res.status(200).json({
            success: true,
            data: offer
        })
    }catch(err){
        return next(new ErrorResponse(`Offer not found with id of ${req.params.id}`, 403)) // will fire if id is not formatted
    }
}

// @desc         delete an offer
// @route        DELETE /api/v1/offers/:id
// @access       Private
exports.deleteOffer = async(req, res, next) => {
    try{
        const offer = await Offer.findByIdAndDelete(req.params.id)

        if(!offer){
            return next(new ErrorResponse(`No product with the id ${req.params.id}`, 404));
        }
        
        res.status(200).json({
            success: true,
            data: {}
        })
    }catch(err){
        next(err)
    }
}