import User from '../models/User';
import Wishlist from '../models/Wishlist';

// @desc         Get all Users
// @route        GET /api/v1/auth/users
// @access       Private/Admin
exports.getUsers = async(req, res, next) => {
    try{
        res.status(200).json(res.advancedResults);
    }catch(err){
        res.status(400).json({ success: false })
    }
}


// @desc         Get Single Users
// @route        GET /api/v1/auth/users/:id
// @access       Private/Admin
exports.getUser = async(req, res, next) => {
    try{
        const user = await User.findById(req.params.id);

        if(!user){
            return res.status(404).json({
                success: false,
                message: `no user found with id ${req.params.id}`
            })
        }

        res.status(200).json({
            success: true,
            data: user
        });

    }catch(err){
        res.status(400).json({ success: false, message: err.message })
    }
}


// @desc         Create User
// @route        POST /api/v1/auth/users
// @access       Private/Admin
exports.createUser = async(req, res, next) => {
    try{
        const user = await User.create(req.body);

        res.status(200).json({
            success: true,
            data: user
        });

    }catch(err){
        // res.status(400).json({ success: false, message: err.message })
        next(err)
    }
}


// @desc         Update User
// @route        PUT /api/v1/auth/users/:id
// @access       Private/Admin
exports.updateUser = async(req, res, next) => {
    try{
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!user){
            return res.status(404).json({
                success: false,
                message: `no user found with id ${req.params.id}`
            })
        }

        res.status(200).json({
            success: true,
            data: user
        });

    }catch(err){
        // res.status(403).json({ success: false, message: err.message })
        next(err)
    }
}


// @desc         Delete User
// @route        DELETE /api/v1/auth/users/:id
// @access       Private/Admin
exports.deleteUser = async(req, res, next) => {
    try{
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });

    }catch(err){
        // res.status(403).json({ success: false, message: err.message })
        next(err)
    }
}

