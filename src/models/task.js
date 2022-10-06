const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: [true, 'Provide title'],
        required: true,
        trim: true,
        minLength: [2, 'Provide minimum 2 characters'],
        maxLength: [64, 'Too long title, provide max. 64 characters'],
    },
    description:{
        type: String,
        required: true,
        trim: true,
        minLength: [2, 'Provide minimum 2 characters'],
        maxLength: [2000, 'Too long description, provide max. 2000 characters'],
    },
    done:{
        type: Boolean,
        default: false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
