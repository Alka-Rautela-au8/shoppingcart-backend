# Shopping cart api

> Backend api for shopping cart

### Includes complete user authentication
- register
- login
- get jwt and send in cookie
- protect and authorize an api
- logout user
- update name and email
- update password
- forgot password (sending password reset token using nodemailer and mailtrap.io)
- reset password 
- password will be hashed (using bcryptjs)

### Advance queries
- select
- sorting
- pagination
- limit
- advance filtering

### Error Handling
- custom ErrorResponse class
- mongoose error handling

### includes crud api
- admin will be able to add category, get all users, delete, update or create user
- admin is hardcoded so no one else can register

#### multiple image upload to cloudinary using express-fileupload
- seller and admin can upload multiple images (I have set it to max 5 images, you can change limit in config file) to cloudinary and image link will be saved in mongodb
- they can also delete a particular image (this will delete image from cloudinary and will remove link from mongodb)

### types of user (there are two types of user)
- seller
- user

## Usage

rename "config/config.env.env" to "config/config.env" and update the values/settings to your own

## Install Dependencies
```
npm install
```

## Run App
```
# Run in dev mode
npm run dev

# Run in production mode
npm start
```

- Version: 1.0.0