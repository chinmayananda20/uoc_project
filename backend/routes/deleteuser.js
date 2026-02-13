const express = require("express")
const router = express.Router()
const User = require("../models/User")
const fetchUsers = require("../middlewares/auth")
router.delete('/',fetchUsers,async (req, res) => {
    const {_id }=req.body
    try {
        const user =await User.findByIdAndDelete(_id)
        if (!user) {
            res.status(404).json({ error: "User not found" });
          }
        res.json({success:"Account deleted succesfully"})
    } catch (error) {
        return res.status(500).send("Something went wrong!")

    }
})
module.exports = router