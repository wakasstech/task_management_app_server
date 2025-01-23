const userModel = require("../modals/userModel");
const { createRandomHexColor } = require("./helperMethods");
// const register = async (user, callback) => {
//   const newUser = userModel({ ...user, color:createRandomHexColor()});
//   await newUser
//     .save()
//     .then((result) => {
//       return callback(false, { message: "User created successfuly!" });
//     })
//     .catch((err) => {
//       return callback({ errMessage: "Email already in use!", details: err });
//     });
// };
const register = async (user,callback) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL; // Get the admin email from the environment variable
    console.log(process.env.ADMIN_EMAIL)
    const newUser = userModel({ ...user, color: createRandomHexColor()});
    if (user.email === adminEmail) {
      newUser.userType = 'admin'; // Set userType to 'admin' for the admin email
    } 
    else {
      newUser.userType = 'team-member'; // Set userType to 'default' for other emails
    }
    const result = await newUser.save();
    callback(null, { message: "User created successfully!" });
  } catch (err) {
    if (err.code === 11000) {
      callback({ errMessage: "Email already in use!", details: err });
    } else {
      callback(err);
    }
  }
};
const login = async (email, callback) => {
  try {
    let user = await userModel.findOne({ email });
    if (!user) return callback({ errMessage: "Your email/password is wrong!" });
    return callback(false, { ...user.toJSON() });
  } catch (err) {
    return callback({
      errMessage: "Something went wrong",
      details: err.message,
    });
  }
};
const getUser = async (id, callback) => {
  try {
    let user = await userModel.findById(id);
    if (!user) return callback({ errMessage: "User not found!" });
    return callback(false, { ...user.toJSON() });
  } catch (err) {
    return callback({
      errMessage: "Something went wrong",
      details: err.message,
    });
  }
};


const getAllUser = async ( callback) => {
  try {
    let users = await userModel.find().select('-password -__v');;
    console.log("we  have :",users.length,"users")
    if (!users) return callback({ errMessage: "Users not found!" });
    return callback(false, users);
  } catch (err) {
    return callback({
      errMessage: "Something went wrong",
      details: err.message,
    });
  }
};
const getUserWithMail = async (email, callback) => {

  console.log(email, 'emailllll')
  try {
    let user = await userModel.findOne({ email });
    if (!user)
      return callback({
        errMessage: "There is no registered user with this e-mail.",
      });
    return callback(false, { ...user.toJSON() });
  } catch (error) {
    return callback({
      errMessage: "Something went wrong",
      details: error.message,
    });
  }
};

const updateUser = async (id, updateData) => {
  try {
    console.log(updateData);
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    console.log(updatedUser)
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const submitOtp = async (otp, newPassword) => {
  try {
    const result = await userModel.findOne({ otp: otp });

    if (!result) {
      throw { code: 404, message: 'OTP not found' };
    }

    if (result.otpUsed) {
      throw { code: 400, message: 'OTP already used' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mark the OTP as used and update the password
    await userModel.updateOne(
      { email: result.email, otpUsed: false }, // Only update if otpUsed is false
      { otpUsed: true, password: hashedPassword }
    );

    return { code: 200, message: 'Password updated' };
  } catch (err) {
    throw { code: 500, message: 'Server error' };
  }
};
module.exports = {
  register,
  login,
  getUser,
  getAllUser,
  getUserWithMail,
  updateUser ,
  submitOtp 
};
