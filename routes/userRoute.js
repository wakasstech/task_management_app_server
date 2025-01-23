const express = require("express");
const userController = require("../Controllers/userController");
const router = express.Router();
 const auth = require("../Middlewares/auth");
router.post("/register",  userController.register);
router.post("/login", userController.login);
router.get("/get-user", userController.getUser);
router.put("/update-user", userController.updateUser);
router.get("/get-all-users", userController.getAllUser);
router.post("/get-user-with-email", userController.getUserWithMail);
router.post('/submit-otp', userController.submitotp)
router.post('/send-otp', userController.sendotp)  
router.post('/send-invitation', userController.sendInvitation)
router.post('/registerViaInvite', userController.registerViaInvite)
router.put("/update-user/:id", userController.updateUser);
module.exports = router;
