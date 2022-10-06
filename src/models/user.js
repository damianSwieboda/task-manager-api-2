const mongoose = require('mongoose')
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minLength: [2, 'Provide minimum 2 characters'],
        maxLength: [64, 'Too long name, provide max. 64 characters'],
        trim: true,
    },
    password:{
        type: String,
        required: [true, 'Provide password'],
        minLength: [8, 'Provide minimum 8 characters'],
        trim: true,
    },
    email:{
        type: String,
        required: [true, 'Provide email'],
        trim: true,
        // unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Provide correct email')
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required:true
        }

    }],
    avatar:{
        type: Buffer
    }
})


userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})
// userSchema.virtual('tasks',{
//     ref: 'Task',
//     localField: '_id',
//     foreignField: 'owner'
// })


userSchema.methods.toJSON = function(){
    const userObject = this.toObject()

    delete userObject.password
    delete userObject.email
    
    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this


    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })

    await user.save()
    return token
}
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user){
        throw new Error('Unable to login!')
    }

    // const hashedPassword = await bcrypt.hash(password, 8)
    // console.log(user.password)
    // console.log(hashedPassword)
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login!')
    }

    return user
}

userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)

    }
    next()
})

userSchema.post('remove', async function(){
    const user = this
    await Task.deleteMany({owner: user.id })
})

const User = mongoose.model('User', userSchema)

module.exports = User