const boardService = require('../Services/boardService');
const create = async (req, res) => {
	const { title, backgroundImageLink, workspaceId } = req.body;
    console.log(backgroundImageLink);
	const  user =req.user;
	if (!(title && backgroundImageLink && workspaceId ))
		return res.status(400).send({ errMessage: 'Title and/or image cannot be null' });
		const validate = req.user.workspaces.filter((workspace) => workspace === workspaceId);
		if (!validate)
			return res
				.status(400)
				.send({ errMessage: 'You can not add a list to the board, you are not a member or owner!' });
	await boardService.create(req, user,(err, result) => {
		if (err) return res.status(500).send(err);
		result.__v = undefined;
		return res.status(201).send(result);
	});
};
const getAll = async (req, res) => {
	console.log(req.user);
	const userId = req.user.id;
	 const{workspaceId} = req.params;
	await boardService.getAll(userId, workspaceId,(err, result) => {
	if (err) return res.status(400).send(err);
	return res.status(200).send(result);
	});
};
const getById = async (req, res) => {
	const { workspaceId , boardId} =req.params
	// Validate whether params.id is in the user's boards or not
	const validate = req.user.workspaces.filter((workspace) => workspace === workspaceId);
	if (!validate)
		return res.status(400).send({ errMessage: 'You can not show the this board, you are not a member or owner!' });
	// Call the service
	await boardService.getById(boardId, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const getActivityById = async (req, res) => {
    const { workspaceId, boardId } = req.params;
    console.log(boardId, workspaceId, "both values");
    // Find the workspace object based on the matching workspaceId
    const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
console.log(workspace);
    if (!workspace) {
        return res
            .status(400)
            .send({ errMessage: 'Workspace not found or you do not have access to it.' });}
	// Call the service
	await boardService.getActivityById(workspaceId,boardId, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const updateBoardTitle = async (req, res) => {
    const { workspaceId, boardId } = req.params;
    console.log(boardId, workspaceId, "both values");
    // Find the workspace object based on the matching workspaceId
    const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
console.log(workspace);
    if (!workspace) {
        return res
            .status(400)
            .send({ errMessage: 'Workspace not found or you do not have access to it.' });
    }
    const { title } = req.body;
	await boardService.updateBoardTitle(workspaceId,boardId, title, req.user, (err, result) => {
		 		if (err) return res.status(400).send(err);
			return res.status(200).send(result);
			});
};
// const updateBoardTitle = async (req, res) => {
// 	// Validate whether params.id is in the user's boards or not
// 	const validate = req.user.boards.filter((board) => board === req.params.id);
// 	if (!validate)
// 		return res
// 			.status(400)
// 			.send({ errMessage: 'You can not change title of this board, you are not a member or owner!' });
// 	const { boardId } = req.params;
// 	const { title } = req.body;
// 	// Call the service
// 	await boardService.updateBoardTitle(boardId, title, req.user, (err, result) => {
// 		if (err) return res.status(400).send(err);
// 		return res.status(200).send(result);
// 	});
// };
const updateBoardDescription = async (req, res) => {
	// Validate whether params.id is in the user's workspace or not
	const { workspaceId, boardId } = req.params;
    console.log(boardId, workspaceId, "both values");

    // Find the workspace object based on the matching workspaceId
    const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
console.log(workspace);
    if (!workspace) {
        return res
            .status(400)
            .send({ errMessage: 'Workspace not found or you do not have access to it.' });
    }
	const { description } = req.body;
	// Call the service
	await boardService.updateBoardDescription( workspaceId,boardId, description, req.user, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const updateBackground = async (req, res) => {
	// Validate whether params.id is in the user's workspace or not
	const { workspaceId, boardId } = req.params;
    console.log(boardId, workspaceId, "both values");

    // Find the workspace object based on the matching workspaceId
    const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
console.log(workspace);
    if (!workspace) {
        return res
            .status(400)
            .send({ errMessage: 'Workspace not found or you do not have access to it.' });
    }
	const { background, isImage } = req.body;
	// Call the service
	await boardService.updateBackground( workspaceId,boardId, background, isImage, req.user, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const addMember = async (req, res) => {
	// Validate whether params.id is in the user's boards or not
	//    // Find the workspace object based on the matching workspaceId
	    const { workspaceId, boardId } = req.params;
	//    const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
	//    console.log("workspace boards:",workspace.boards)
	//    const board = workspace.boards.find(board => board.toString() === boardId);
	//    console.log(workspace);
	// 	   if (!workspace && !board) {
	// 		   return res
	// 			   .status(400)
	// 			   .send({ errMessage: 'You can not add member to this board, you are not a member or owner!' });
	// 	   }
	const { members } = req.body;
	// Call the service
	await boardService.addMember( workspaceId,boardId, members, req.user, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};

const deleteMember = async (req, res) => {
	// Validate whether params.id is in the user's boards or not
	//    // Find the workspace object based on the matching workspaceId
	    const { workspaceId, boardId } = req.params;
	//    const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
	//    console.log("workspace boards:",workspace.boards)
	//    const board = workspace.boards.find(board => board.toString() === boardId);
	//    console.log(workspace);
	// 	   if (!workspace && !board) {
	// 		   return res
	// 			   .status(400)
	// 			   .send({ errMessage: 'You can not add member to this board, you are not a member or owner!' });
	// 	   }
	const { memberId } = req.body;
	// Call the service
	await boardService.deleteMember( workspaceId,boardId, memberId, req.user, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const deleteById = async (req, res) => {
	// deconstruct the params
	const { workspaceId,   boardId } = req.params;
	const user = req.user;
		// Validate whether params.id is in the user's workspaces or not
		const validate = req.user.workspaces.filter((workspace) => workspace === workspaceId);
		if (!validate)
			return res.status(400).send({ errMessage: 'You can not delete the this board, you are not a member or owner!' });
	// Validate the  boardId
	if (!(boardId)) return res.status(400).send({ errMessage: 'board undefined' });
	await boardService.deleteById( boardId,workspaceId , user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
module.exports = {
	create,
	getAll,
	getById,
	getActivityById,
	updateBoardTitle,
	updateBoardDescription,
	updateBackground,
	addMember,
	deleteMember,
	deleteById
};