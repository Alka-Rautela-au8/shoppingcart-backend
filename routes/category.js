import express from 'express';

import { 
    getCategory, 
    createCategory, 
    getSingleCategory, 
    updateCategory, 
    deleteCategory
} from '../controllers/category';

// import {getProducts, addProduct} from '../controllers/product';

import Category from '../models/Category';

// include other resource routers
import productRouter from './product';

import advancedResults from '../middleware/advancedResults';

import {protect, authorize} from '../middleware/auth';


const router = express.Router();

// Re-router into other resource routers
router.use('/:categoryId/products', productRouter);


router
    .route('/')
        .get(advancedResults(Category), getCategory)

router
    .route('/:id')
        .get( getSingleCategory )

// //-----------------Product Route-------------------------------//
// router.route('/:categoryId/products')
//     .get(advancedResults(Product, {
//         path: 'category',
//         select: 'name'
//     }), getProducts)
//     .post(protect, authorize('seller', 'admin'), addProduct)  // only seller and admin will be able to add products
// //-------------------------------------------------------------//

router.use(protect) // all the routes below this will be protected
router.use(authorize('admin')) // in all the routes below this, only admin will be able to perform crud

router.post('/', createCategory)
router
    .route('/:id')
        .put(updateCategory)
        .delete(deleteCategory)

module.exports = router;