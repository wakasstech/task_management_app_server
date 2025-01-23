const workspaceService = require('../Services/workspaceService.js');
const create = async (req, res) => {
	if (req.user.userType !== 'admin') {
		return res.status(403).json({ errMessage: 'Access denied. Only admins can create workspaces.' });
	  }
	const { name, type, description } = req.body;
	if (!(name && type ))
		return res.status(400).send({ errMessage: 'name and/or type cannot be null' });
	await workspaceService.create(req, (err, result) => {
		if (err) return res.status(500).send(err);
		result.__v = undefined;
		return res.status(201).send(result);
	});
};
const getWorkspaces= async (req, res) => {
    console.log(req.user);
	const userId = req.user.id;
	await workspaceService.getWorkspaces(userId, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const getWorkspace = async (req, res) => {
	const { workspaceId } = req.params;
	// Validate whether params.id is in the user's boards or not
	const validate = req.user.workspaces.filter((workspace) => workspace === workspaceId);
	if (!validate)
		return res.status(400).send({ errMessage: 'You can not show this workspace, you are not a member or owner!' });
	// Call the service
	await workspaceService.getWorkspace(workspaceId, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const updateWorkspaceDescription = async (req, res) => {
	// Validate whether params.id is in the user's boards or not
	const validate = req.user.workspaces.filter((Wspace) => Wspace === req.params.id);
	if (!validate)
		return res
			.status(400)
			.send({ errMessage: 'You can not change description of this board, you are not a member or owner!' });
	const { workspaceId } = req.params;
	const { description } = req.body;
	// Call the service
	await workspaceService.updateWorkspaceDescription(workspaceId, description, req.user, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const updateWorkspaceName = async (req, res) => {
	// Validate whether params.id is in the user's boards or not
	const validate = req.user.workspaces.filter((Wspace) => Wspace === req.params.id);
	if (!validate)
		return res
			.status(400)
			.send({ errMessage: 'You can not change background of this board, you are not a member or owner!' });
	const { workspaceId } = req.params;
	const { name } = req.body;
	// Call the service
	await workspaceService.updateWorkspaceName(workspaceId, name,req.user, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const addMember = async (req, res) => {
	// Validate whether params.id is in the user's workspaces or not
	const validate = req.user.workspaces.filter((workspace) => workspace === req.params.id);
	console.log(validate);
	if (!validate)
		return res
			.status(400)
			.send({ errMessage: 'You can not add member to this workspace, you are not a member or owner!' });
	const { workspaceId } = req.params;
	const { members } = req.body;
	// Call the service
	await workspaceService.addMember(workspaceId, members, req.user, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const newAddMember = async (req, res) => {
	// Validate whether params.id is in the user's workspaces or not
	const validate = req.user.workspaces.filter((workspace) => workspace === req.body.workspaceId);
	console.log(validate);
	if (!validate)
		return res
			.status(400)
			.send({ errMessage: 'You can not add member to this workspace, you are not a member or owner!' });
	const { workspaceId, memberId, boardIds, listIds, cardIds } = req.body;
	// Call the service
	console.log("in the  controller")
	await workspaceService.newAddMember(workspaceId, memberId, boardIds, listIds, cardIds , req.user, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
const deleteMember = async (req, res) => {
	// Validate whether params.id is in the user's workspaces or not
	const validate = req.user.workspaces.filter((workspace) => workspace === req.params.id);
	console.log(validate);
	if (!validate)
		return res
			.status(400)
			.send({ errMessage: 'You can not add member to this workspace, you are not a member or owner!' });
	const { workspaceId } = req.params;
	const { memberId } = req.body;
	// Call the service
	await workspaceService.deleteMember(workspaceId, memberId, req.user, (err, result) => {
		if (err) return res.status(400).send(err);
		return res.status(200).send(result);
	});
};
module.exports = {
	create,
	getWorkspaces,
    getWorkspace,
	updateWorkspaceDescription,
	updateWorkspaceName,
	newAddMember,
	addMember,
	deleteMember
};
