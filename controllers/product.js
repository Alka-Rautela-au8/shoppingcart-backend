import ErrorResponse from '../utils/errorResponse';
import Product from '../models/Product';
import Category from '../models/Category';

import path from 'path';
import fs from 'fs';

import cloudinary from '../utils/cloudinary';

// @desc         Get all Products
// @route        GET /api/v1/products
// @route        GET /api/v1/category/:categoryId/products
// @access       Public
exports.getProducts = async(req, res, next) => {
    try{
        if(req.params.categoryId){
            const products = await Product.find({category: req.params.categoryId});

            // all the product of selected category
            if(!products){
                return next(new ErrorResponse(`Category not found with id of ${req.params.categoryId}`, 404))
            }

            console.log(res)
            

            Product.find({category: req.params.categoryId}).then(response => {
                console.log(response)
                res.status(200).json(response.advancedResults)
            }).catch(err => next(err))

            
            // res.status(200).json({
            //     success: true,
            //     count: products.length,
            //     data: products
            // });
        }else{
            res.status(200).json(res.advancedResults)
        }
    }catch(err){
        next(err)
    }
}


// @desc         Get Single product
// @route        GET /api/v1/products/:id
// @access       Public
exports.getProduct = async(req, res, next) => {
    try{    
        const product = await Product.findById(req.params.id).populate({
            path: 'category',
            select: 'name'
        });

        if(!product){
            return next(new ErrorResponse(`No product with the id of ${req.params.id}`, 404))
        }

        res.status(200).json({
            success: true,
            data: product
        })
    }catch(err){
        next(err)
    }
}

// @desc         Add product
// @route        POST /api/v1/category/:categoryId/products
// @access       Private
exports.addProduct = async(req, res, next) => {
    try{
        req.body.category = req.params.categoryId;
        req.body.user = req.user.id;
    
        const category = await Category.findById(req.params.categoryId)
    
        if(!category){
            return next(new ErrorResponse(`No category with id of ${req.params.categoryId}`))
        }
    
        const product = await Product.create(req.body);
    
        res.status(201).json({
            success: true,
            data: product
        })
    }catch(err){
        next(err);
    }
}

// @desc         update product
// @route        PUT /api/v1/products/:id
// @access       Private
exports.updateProduct = async(req, res, next) => {
    try{
        let product = await Product.findById(req.params.id);

        if(!product){
            return next(new ErrorResponse(`No product with the id ${req.params.id}`, 404))
        }
    
        // make sure user is product owner
        if(product.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`User ${req.user.id} is not authorized to update product ${product._id}`, 401)
            )
        }
    
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidator: true
        })
    
        res.status(200).json({
            success: true,
            data: product
        })
    }catch(err){
        next(err)
    }
}

// @desc         Delete product
// @route        DELETE /api/v1/products/:id
// @access       Private
exports.deleteProduct = async(req, res, next) => {
    try{
        const product = await Product.findById(req.params.id);

        if(!product){
            return next(new ErrorResponse(`No product with the id of ${req.params.id}`, 404))
        }

        // Make sure user is product owner
        if(product.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`User ${req.user.id} is not authorized to delete product ${product._id}`, 401)
            )
        }

        // deleting a product should also delete pictures from cloudinary
        let imgArray = product.image
        // console.log('product', product.image)
        if(imgArray){
            for(let img of imgArray){
                cloudinary.uploader.destroy(img.cloudinary_id);
            }
        }

        await product.remove()
    
        res.status(200).json({
            success: true,
            data: {}
        })
    }catch(err){
        next(err)
    }
}

