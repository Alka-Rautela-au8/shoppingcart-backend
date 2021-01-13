import express from 'express';

import { 
    getAllWishlists, 
    getWishlist, 
    addProductToWishlist, 
    removeProductFromWishlist
} from '../controllers/wishlist';

import {protect, authorize} from '../middleware/auth';

const router = express.Router();

router
    .route('/')
        .get(protect, authorize('admin'), getAllWishlists)

router
    .route('/:userId')
        .get(protect, authorize('admin'), getWishlist)

router
    .route('/addtowishlist/:productId')
        .post(protect, addProductToWishlist)

router
    .route('/remove/:productId')
        .delete(protect, removeProductFromWishlist)

module.exports = router;