import express from 'express';

import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/users';

import User from '../models/User';

import advancedResults from '../middleware/advancedResults';

import {protect, authorize} from '../middleware/auth';

// mergeParams : true (for merging url params)
const router = express.Router({mergeParams: true});

router.use(protect) // all the routes below this will be protected
router.use(authorize('admin')) // in all the routes below this, only admin will be able to perform crud

router
    .route('/')
        .get(advancedResults(User), getUsers)
        .post(createUser);

router
    .route('/:id')
        .get(getUser)
        .put(updateUser)
        .delete(deleteUser)

module.exports = router;