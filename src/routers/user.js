const express = require('express')
const router = express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const sharp = require('sharp')
const { sendWelconeEmail, sendDeleteEmail } = require('../emails/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try{
        const token = await user.generateAuthToken()
        await user.save()

        sendWelconeEmail(user.email, user.name)

        res.status(201).send({user, token})
    } catch(error) {
        res.status(500).send(error.message)
    }
})

router.post('/users/login', async (req, res)=>{
    
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch(error){
        res.status(500).send(error.message)
    }
})

router.get('/users/me', auth, async (req, res) => {
    try{
        res.send(req.user)
    } catch(error) {
        res.status(500).send(error.message)
    }
})

router.post('/logout', auth,  async (req, res) => {   
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send('Logged out successfully')
    } catch(error){
        res.status(500).send()
    }
})

router.post('/logoutAll', auth,  async (req, res) => {   
    try{
        req.user.tokens = []
        await req.user.save()
        res.send('Logged out successfully from all devices')
    } catch(error){
        res.status(500).send()
    }
})

router.patch('/users/patch', auth, async(req, res)=>{
    const keys = Object.keys(req.body)
    const avaibleUpdates = ['name', 'email', 'password']

    try{        
        const isUpdateValid = keys.every(update => avaibleUpdates.includes(update))        
        if(!isUpdateValid){
            throw new Error('Cannot update')
        }
        
        keys.forEach(item=>{
            req.user[item] = req.body[item]
        })

        await req.user.save()
        res.send(req.user)
    } catch(error){
        res.send(error.message)
    }    
})

router.delete('/user', auth, async(req, res)=>{
    try{
        await req.user.remove()
        sendDeleteEmail(req.user.email, req.user.name)
        res.send('Deleted sucesfully')
    }catch(error){
        res.status(400).send()
    }
})

const maxSize = 1 * 1000 * 1000
const upload = multer({
    limits:{
        fieldSize: maxSize
    },
    fileFilter: function(req, file, cb){
        const ext = path.extname(file.originalname)
        if(ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
            return (new Error('Unvalid file type'))
        }
        cb(undefined, true)
    }
})

//<img src="data:image/jpg;base64,/9j/4AAQS[...]
router.post('/users/avatar', auth, upload.single('avatar'), async (req, res) =>{
    const buffer = await sharp(req.file.buffer).resize(320, 240).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)       
    }catch(error){
        res.status(404).send()
    }
})

router.delete('/users/me/avatar', auth,  async (req, res) => {
    try{
        req.user.avatar = undefined

        await req.user.save()
        res.send('Avatar deleted sucessfully!')
    }catch(error){
        res.status(400).send(error.message)
    }
})




module.exports = router;
