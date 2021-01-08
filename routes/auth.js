import express from 'express';

import {
    register,
    login, 
    logout,
    getMe, 
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    verifyUser
} from '../controllers/auth';

import {protect} from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.put('/verify',protect, sendVerificationEmail);
router.put('/verify/:verificationtoken',protect, verifyUser);
router.get('/me',protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;