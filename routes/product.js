import express from 'express';

import {
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/product';

import{
    photoUpload
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

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('seller', 'admin'), updateProduct)
    .delete(protect, authorize('seller', 'admin'), deleteProduct)

router.route('/:id/photo')
    .put(protect, authorize('seller', 'admin'), photoUpload)


module.exports = router;