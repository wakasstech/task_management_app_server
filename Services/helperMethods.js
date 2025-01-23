const cardModel = require('../modals/cardModel');
const listModel = require('../modals/listModel');
const boardModel = require('../modals/boardModel');
const labelsSeed = [
	{ text: '', color: '#61bd4f', backColor: '#519839', selected: false },
	{ text: '', color: '#f2d600', backColor: '#d9b51c', selected: false },
	{ text: '', color: '#ff9f1a', backColor: '#cd8313', selected: false },
	{ text: '', color: '#eb5a46', backColor: '#b04632', selected: false },
	{ text: '', color: '#c377e0', backColor: '#89609e', selected: false },
	{ text: '', color: '#0079bf', backColor: '#055a8c', selected: false },
];
const createRandomHexColor = () => {
	const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];
	let hex = '#';
	for (let i = 0; i < 6; i++) {
		const index = Math.floor(Math.random() * values.length);
		hex += values[index];
	}
	return hex.toString();
};
const validateCardOwners = async (card = null, list, board,workspace, isCreate = false) => {
	console.log("userssss:",workspace);
	const validate = isCreate ? true : list.cards.find((item) => item.toString() === card._id.toString());
	const validate2 = board.lists.find((item) => item.toString() === list._id.toString().toString());
	console.log("validate",validate);
	console.log("validate2",validate2);
	console.log("workspace.board>",workspace.boards);
	const validate3 = workspace.boards.find((item) => item.toString() === board._id.toString());
	console.log("validate3");
	return validate && validate2 && validate3;
};
module.exports = {
	labelsSeed,
	createRandomHexColor,
	validateCardOwners
};