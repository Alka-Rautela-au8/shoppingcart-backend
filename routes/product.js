import express from 'express';

import {
    getProducts,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/product';

import{
    photoUpload,
    removePhoto
} from '../controllers/photoController';

import Product from '../models/Product';
import advancedResults from '../middleware/advancedResults';

import {protect, authorize} from '../middleware/auth';

// merge params 
const router = express.Router({mergeParams: true});

router.route('/')
    .get(advancedResults(Product, {
        path: 'category',
        select: 'name'
    }), getProducts)
    .post(protect, authorize('seller', 'admin'), addProduct)

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('seller', 'admin'), updateProduct)
    .delete(protect, authorize('seller', 'admin'), deleteProduct)

router.route('/:id/photo')
    .put(protect, authorize('seller', 'admin'), photoUpload)

router.route('/:id/photo/:imageId')
    .put(protect, authorize('seller', 'admin'), removePhoto)


module.exports = router;