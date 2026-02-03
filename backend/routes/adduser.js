const express = require("express")
const router = express.Router()
const User = require("../models/User")
const { body, validationResult } = require('express-validator')
const bcrypt = require("bcrypt")


router.post("/",[
    body('password', 'password must be minimum of 6 characters').isLength({ min: 6 }),
    body('name', 'enter a valid name').isLength({ min: 3 }),
    body('email', 'enter a valid email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({ error: "Error!" })

    }
    try {
        let user = await User.findOne({ email: req.body.email })
        let student_number = await User.findOne({ student_number: req.body.student_number })
        if (user || student_number) {
            
            return res.json({ error: "Email or Student ID Invalid!" })

        }
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(req.body.password, salt)
        user = await User.create({
            name : req.body.name,
            student_number : req.body.student_number,
            email : req.body.email,
            password : secPass
        })
        
        res.json({ success:"Signin Successful" })
    } catch (error) {
        console.error(error.message)
        return res.status(500).send("Something went wrong!")
    }
})
module.exports = router