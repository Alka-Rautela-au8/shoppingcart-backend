import ErrorResponse from '../utils/errorResponse'; 
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';

// @desc         get wishlists
// @route        get /api/v1/wishlists 
// @access       Private/Admin
exports.getAllWishlists = async(req, res, next) => {
    try{
        const wishlist = await Wishlist.find().populate({
            path: 'user', 
            select: 'name email'
        })

        res.status(200).json({
            success: true,
            data: wishlist
        });
    }
    catch(err){
        next(err)
    }
}

// @desc         Get wishlist by user id
// @route        GET /api/v1/auth/wishlists/:userId
// @access       Private/user
exports.getWishlist = async(req, res, next) => {
    try{
        const wishlist = await Wishlist.findOne({user: req.params.userId}).populate({
            path: 'user', 
            select: 'name email'
        })

        if(!wishlist){
            return next(new ErrorResponse('this user does not exists', 404))
        }
        res.status(200).json({
            success: true, 
            data: wishlist
        })
    }catch(err){
        next(err)
    }
}


// @desc         current users wishlist
// @route        GET /api/v1/auth/wishlist
// @access       Private/user
exports.getMyWishlist = async(req, res, next) => {
    try{
        let wishlist = await Wishlist.findOne({user: req.user.id}).populate({
            path: 'user', 
            select: 'name email'
        });

        if(!wishlist){
            return next(new ErrorResponse('you are not authorized to access this route', 401))
        }

        // check if item present in wishlist has been deleted or not
        // if deleted then delete that item from wishlist as well

        let list = wishlist.items

        let deletedProds = []

        let index = 0;

        var makingAsync = new Promise((resolve, reject) => {
            
            list.forEach(async(item) => {
                let prod = await Product.findById(item._id) 
                if(!prod){
                    deletedProds.push(item._id.toString())
                }
                
                index += 1;
                // resolve when forEach loop ends
                if(index === list.length) resolve();
            })
        })

        makingAsync.then(async() => {
            
            list = list.filter(listItem => deletedProds.includes(listItem._id.toString()) === false)

            wishlist = await Wishlist.findByIdAndUpdate(wishlist._id, {
                items: list
            })
    
            // Add pagination to the result
            const reqQuery = {...req.query};
    
            const removeFields = ['page', 'limit']
    
            removeFields.forEach(param => delete reqQuery[param]);
    
            // Create query string
            let queryStr = JSON.stringify(reqQuery);
    
            // finding resources by parsing query to js object
            let query = Wishlist.find(JSON.parse(queryStr));
    
            //////
    
            res.status(200).json({
                success: true,
                count: wishlist.items.length,
                data: wishlist
            })
        })
    }catch(err){
        next(err);
    }
}

// @desc         add products to wishlist
// @route        GET /api/v1/wishlist/addtowishlist/:productId
// @access       Private/user
exports.addProductToWishlist = async(req, res, next) => {
    try{
        let wishlist = await Wishlist.findOne({user : req.user.id})

        const product = await Product.findById(req.params.productId) 

        if(!wishlist){
            return next(new ErrorResponse('you are not authorized to access this route', 401))
        }
        if(!product){
            return next(new ErrorResponse(`Product with id ${req.params.productId} not found`, 404))
        }

        let items = wishlist.items

        let isAlreadyThere = false

        items.forEach(item => {

            // for comparing --> convert into string

            if(item._id.toString() === product._id.toString()){
                isAlreadyThere = true
            }
        })

        if(isAlreadyThere){
            return next(new ErrorResponse(`product ${req.params.productId} already in wishlist`))
        }else{
            let newWishlist =  await Wishlist.findByIdAndUpdate(wishlist._id, {
                items: [product, ...items]
            })
    
            res.status(201).json({
                success: true,
                data: newWishlist
            })
        }

    }catch(err){
        next(err)
    }
}

// @desc         remove products from wishlist
// @route        GET /api/v1/wishlist/remove/:productId
// @access       Private/user
exports.removeProductFromWishlist = async(req, res, next) => {
    try{
        let wishlist = await Wishlist.findOne({user : req.user.id})

        const product = await Product.findById(req.params.productId) 

        if(!wishlist){
            return next(new ErrorResponse('you are not authorized to access this route', 401))
        }
        if(!product){
            return next(new ErrorResponse(`Product with id ${req.params.productId} not found`, 404))
        }

        let items = wishlist.items
        items = items.filter(item => item._id.toString() !== req.params.productId)

        wishlist = await Wishlist.findByIdAndUpdate(wishlist._id, {
            items: items
        })
        res.status(201).json({
            success: true,
            data: {}
        })
    }catch(err){
        next(err)
    }
}