const mongoose = require('mongoose');
const listSchema = mongoose.Schema({
	title: {
		type: String,
		require: true,
	},
	cards: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'card',
		}
	],
	members: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'user',
			},
			name: {
				type: String,
			},
			surname: {
				type: String,
			},
			email: {
				type: String,
			},
			role: {
				type: String,
				default: 'member',
			},
			color: {
				type:String,
			}
		},
	],

	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'board',
	},
});
module.exports = mongoose.model('list', listSchema);
