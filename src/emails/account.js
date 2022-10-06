const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelconeEmail = async (email, name) =>{
    sgMail.send({
        to: email, // Change to your recipient
        from: 'damianswieboda07@gmail.com', // Change to your verified sender
        subject: 'Thanks for joining us!',
        text: `Hello ${name}, welcome in our site!`,
    })
}

const sendDeleteEmail = async (email, name) => {
    sgMail.send({
        to: email,
        from: 'damianswieboda07@gmail.com', // Change to your verified sender
        subject: 'We are sorry you leaving us! Give us feedback!',
        text: `Hello ${name}, welcome in our site!`, 
    })
}

module.exports = {
    sendWelconeEmail,
    sendDeleteEmail    
}