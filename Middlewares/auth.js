const jwt = require("jsonwebtoken");
const userModel = require("../modals/userModel");
const generateToken = (id, email) => {
  const token = jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE_TIME,
  });
  return token.toString();
};
const generateInvitationToken = (email) => {
  const token = jwt.sign({email}, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE_TIME,
  });
  return token.toString();
};




const verifyToken = async(req, res, next) => {
  try {
    if (!req.headers["authorization"])
      return res
        .status(401)
        .send({ errMessage: "Authorization token not found!" });
    const header = req.headers["authorization"];
    const token = header.split(" ")[1];
    await jwt.verify(token, process.env.JWT_SECRET, async(err, verifiedToken) => {
      if (err)
        return res
          .status(401)
          .send({ errMessage: "Authorization token invalid", details: err });
      const user = await userModel.findById(verifiedToken.id);
      req.user = user;
      next();
    });
  } catch (error) {
    return res
      .status(500)
      .send({
        errMesage: "Internal server error occured!",
        details: error.message,
      });
  }
};
// adminAccessMiddleware.js
const adminAccessMiddleware = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ errMessage: 'Access denied. Only admins can access this route.' });
  }
  next(); // Proceed to the next middleware or route handler
};
module.exports = {
  generateToken,
  generateInvitationToken,
  verifyToken,
  adminAccessMiddleware
};
