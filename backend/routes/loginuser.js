const express = require("express")
const router = express.Router()
const User = require("../models/User")
const { body, validationResult } = require('express-validator')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const jwt_secret = process.env.JWT_SECRET

router.post("/", [
    body('password', 'password cannot be blank').exists(),
    body('email', 'enter a valid email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ error: "please enter valid details" })
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }
        const data = {
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        }
        const authtoken = jwt.sign(data, jwt_secret,{ expiresIn: "30m" })
        res.json({ authtoken })
    } catch (error) {
        console.error(error.message)
        return res.status(500).send("Something went wrong!")
    }
})

module.exports = router