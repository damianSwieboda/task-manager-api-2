const express = require('express');
const mongoose = require('mongoose');
const router = express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
    try{
        const task = new Task({...req.body, owner: req.user._id}); // <--- '...' x2
        await task.save()
        res.send(task)
    } catch(error){
        res.status(500).send(error.message)
    }
})

router.get('/tasks/:id', auth, async (req, res)=>{
    try{
        const _id = req.params.id
        const task = await Task.findOne({ _id, owner: req.user.id })
        
        if(!task){
            return res.status(404).send('Cannot find')
        }

        res.send(task)
    }catch(error){
        res.status(500).send(error.message)
    }

})


router.get('/tasks', auth, async (req, res) => {


    try{
        await req.user.populate('tasks')
        res.send(req.user.tasks)
    } catch(error){
        res.status(500).send(error.message)
    }
})

router.delete('/tasks/:id', auth, async (req, res) =>{
    try{
        const deletedTask = await Task.findOneAndDelete({_id: req.params.id})

        if(!deletedTask){
            return res.status(404).send('Cannot find task')
        }

        res.send('Task sucesfully deleted!')
    } catch(error){
        res.status(500).send(error.message)
    }
});

router.patch('/tasks/:id', auth, async (req, res)=>{
    try{
        const keys = Object.keys(req.body);
        const avaibleUpdates = ['title', 'description', 'done']    
    
        const isUpdateValid = keys.every(item => avaibleUpdates.includes(item))
        if(!isUpdateValid){
            return res.status(400).send('Cannot update')
        }
    
        const task = await Task.findOne({_id: req.params.id})
        if(!task){
            return res.status(404).send('Cannot find task')
        }

        keys.forEach(item => task[item] = req.body[item])
        
        await task.save()
        res.send(task)

    } catch(error) {
        res.status(500).send(error.message)
    }    
});



module.exports = router