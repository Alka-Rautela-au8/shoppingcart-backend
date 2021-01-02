const advancedResults = (model, populate) => async(req, res, next) => {
    
    // Copying req.query
    const reqQuery = {...req.query};

    /* Fields to exclude (because when we pass these in query, it looks these keys as actual parameter to match in db)
    so if we pass localhost:3000?select=name,description
    it will look for field called select */
    const removeFields = ['select', 'sort', 'page', 'limit']

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create Operators ($gt, $gte, etc) (adding $ sign at the front of any key present in query such as gt, gte, lt, lte etc )
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `${match}`);
    // [in] if used for searching in list
    // ex :  localhost:3000?listName[in]=itemName

    // Finding resource by parsing query to js object
    let query = model.find(JSON.parse(queryStr));

    // Select fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields)
    }

    // Sort 
    if(req.query.sort){
        // incase we added more parameters in sort like sort=name,id  ---> name,_id.split(',') ---> ['name', '_id'] -----> ['name', '_id'].join(" ") ----> "name id"
        const sortBy = req.query.sort.split(',').join(' ');

        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt'); // default
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;  // limiting item per page, by default its 20
    const startIndex = (page - 1) * limit; // Number of models to skip
    const endIndex = page * limit;
    const total = await model.countDocuments() // method for counting all the documents

    query = query.skip(startIndex).limit(limit);

    if(populate){
        query = query.populate(populate)
    }

    // Executing query
    const results = await query;

    // pagination result
    const pagination = {};

    if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true, 
        count: results.length,
        pagination,
        data: results
    }

    next();
}

module.exports = advancedResults;