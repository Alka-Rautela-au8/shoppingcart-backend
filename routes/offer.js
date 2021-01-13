import express from 'express';

import {
    getOffer, 
    createOffer,
    getSingleOffer, 
    updateOffer, 
    deleteOffer
} from '../controllers/offer';

import Offer from '../models/Offer';

import advancedResults from '../middleware/advancedResults';

import {protect, authorize} from '../middleware/auth';

const router = express.Router();

router
    .route('/')
        .get(advancedResults(Offer), getOffer)

router
    .route('/:id')
        .get(getSingleOffer)

router.use(protect) // all the routes below this will be protected
router.use(authorize('admin')) // in all the routes below this, only admin will be able to perform crud

router.post('/', createOffer)

router
    .route('/:id')
        .put(updateOffer)
        .delete(deleteOffer)

module.exports = router;
