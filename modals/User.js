const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, 
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    tokens:[{
        token:{ type:String ,
                required:true
              }}
    ],
  },
  { timestamps: true }
);
// we are generating AuthenticationToken
UserSchema.methods.generateAuthToken= async function(){
    try {
        let mytoken =jwt.sign({_id:this._id},process.env.SECRET_lINKKEY);
        this.tokens=this.tokens.concat({token:mytoken});
        this.save();
        return mytoken;
    } catch (error) { 
        console.log(error)   
    }
    }
module.exports = mongoose.model("User", UserSchema);
