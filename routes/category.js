import express from 'express';

import { 
    getCategory, 
    createCategory, 
    getSingleCategory, 
    updateCategory, 
    deleteCategory
} from '../controllers/category';

import Category from '../models/Category'
import Product from '../models/Product';

import advancedResults from '../middleware/advancedResults';

import {protect, authorize} from '../middleware/auth';
import {getProducts, addProduct} from '../controllers/product';

// mergeParams : true (for merging url params)
const router = express.Router({mergeParams: true});


router
    .route('/')
        .get(advancedResults(Category), getCategory)

router
    .route('/:id')
        .get( getSingleCategory )

//-----------------Product Route-------------------------------//
router.route('/:categoryId/products')
    .get(advancedResults(Product, {
        path: 'category',
        select: 'name'
    }), getProducts)
    .post(protect, authorize('seller', 'admin'), addProduct)
//-------------------------------------------------------------//

router.use(protect) // all the routes below this will be protected
router.use(authorize('admin')) // in all the routes below this, only admin will be able to perform crud

router.post('/', createCategory)
router
    .route('/:id')
        .put(updateCategory)
        .delete(deleteCategory)

module.exports = router;