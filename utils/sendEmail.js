const nodemailer = require("nodemailer");
import {google} from "googleapis";

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN})

const sendEmail = async(options) => {
    try{
        // get access token from oAuth2 client
        const accessToken = await oAuth2Client.getAccessToken()
        
        const transporter = nodemailer.createTransport({
            // host: process.env.SMTP_HOST,
            // port: process.env.SMTP_PORT,
            // auth: {  
            // user: process.env.SMTP_EMAIL, 
            // pass: process.env.SMTP_PASSWORD,
            // },

            service:'gmail',
            auth:{
                type: 'OAuth2',
                user: process.env.FROM_EMAIL2,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken
            }
        });
    
        // send mail with defined transport object
        const message = {
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL2}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        }
    
        const info = await transporter.sendMail(message)
    
        console.log("Message sent: %s", info.messageId);

    }catch(err){
        return err
    }
}

module.exports = sendEmail;