import ErrorResponse from '../utils/errorResponse';
import Product from '../models/Product';

import path from 'path';
import fs from 'fs';

import cloudinary from '../utils/cloudinary';

// @desc         Upload photo for product
// @route        PUT /api/v1/products/:id/photo
// @access       Private
exports.photoUpload = async(req, res, next) => {
    try{
        const product = await Product.findById(req.params.id);

        if(!product){
            return next(new ErrorResponse(`No product with id of ${req.params.id}`, 404))
        }

        // make sure user is category owner
        if(product.user.toString !== req.user.id && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`User ${req.params.id} is not authorized to update this product`, 401)
            )
        }

        if(!req.files){
            return next(new ErrorResponse(`Please upload an image`, 400))
        }

        // const images = req.files;
        console.log('req.files--->', req.files)

        if(Object.keys(req.files).length > process.env.MAX_IMAGE_COUNT){
            return next(
                new ErrorResponse(`maximum ${process.env.MAX_IMAGE_COUNT} images can be uploaded`, 400)
            )
        }

        let wrongFileType = false
        let sizeCrossed = false
        
        Object.entries(req.files).forEach(file => {
            // console.log(file[1].name)
            let allGood = true

            // check type of file
            if(!file[1].mimetype.startsWith('image')){
                wrongFileType = true
                allGood = false
            }
            
            // check size of image
            if(allGood && file[1].size > process.env.MAX_IMAGE_SIZE * 1000000){
                sizeCrossed = true
                allGood = false
            }

            // change the name of file
            if(allGood){
                file[1].name = `product_${product._id}${Math.floor(Math.random()*100)}${Date.now()}${path.parse(file[1].name).ext}`
                console.log(file[1].name)
            }

            console.log(file[1])
        })

        if(wrongFileType){
            return next(new ErrorResponse(`Please upload image only`, 400))
        }

        if(sizeCrossed){
            return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_IMAGE_SIZE} MB`, 400))
        }
        console.log('req.files->', req.files)

        const data = []

        let index = 0
        
        // for making forEach asynchronous 
        var makingAsync = new Promise((resolve, reject) => {
            Object.entries(req.files).forEach( async(file) => {
                // uploading image in cloudinary
                const result = await cloudinary.uploader.upload(file[1].tempFilePath)
                // console.log('result ---->   ', result)

                data.push({
                    url: result.secure_url,
                    cloudinary_id: result.public_id
                })

                // resolve when all images get uploaded
                index += 1;
                if(index === Object.keys(req.files).length) resolve();
            })
        })

        makingAsync.then(() => {
            console.log("data", data)

            Product.findByIdAndUpdate(product._id, {image: data}).then(response => {
                res.status(200).json({
                    success: true,
                    data: data
                })

                // now delete temp folder after everything is done

                // directory path
                const dir = 'tmp';

                // just to check files inside tmp folder
                fs.readdir(dir, (err, files) => {
                    if(err)throw err;

                    files.forEach(file => {
                        console.log(file)
                    })
                })

                // delete directory recursively
                fs.rmdir(dir, {recursive: true}, (err)=> {
                    if(err)throw err;

                    console.log(`${dir} is deleted!`)
                })

            }).catch(err => {
                console.log(err)
            })
        }).catch(err => console.log(err))


    }catch(err){
        next(err)
    }
}
