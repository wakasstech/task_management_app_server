const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	surname: {
		type: String,
		required: true,
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
	avatar: {
		type: String,
	},
	color: {
		type: String,
	},
	workspaces: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'workspace',
		},
	],
	userType: {
		type: String,
		default: "team-member",
		enum: ["team-member", "HR", "admin","manager","SQA","user"]
	  },
	otp:{
		type:Number
	},
	invitationToken:{
		type:String
	},

	otpUsed:{
		type:Boolean,
	}
});
module.exports = mongoose.model('user', userSchema);
