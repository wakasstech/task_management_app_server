const cardService = require('../Services/cardservice');
const create = async (req, res) => {
	// Deconstruct the parameter
    console.log("in the route")
	const { workspaceId, title, listId, boardId } = req.body;
	const user = req.user;
	// Validate the inputs
	if (!( workspaceId && title && listId && boardId))
		return res
			.status(400)
			.send({ errMessage: 'The create operation could not be completed because there is missing information'});
	//Call the card service
	await cardService.create(  workspaceId,title, listId, boardId, user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(201).send(result);
	});
};
const getCard = async (req, res) => {
	// Get params
	const user = req.user;
	const {workspaceId, boardId, listId, cardId } = req.params;
	// Call the card service
	await cardService.getCard(  workspaceId,cardId, listId, boardId, user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const getAllCards = async (req, res) => {
	// Assing parameter to constant
	const { workspaceId,boardId,listId } = req.params;
	const userId = req.user.id
	const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
    if (!workspace) {
        return res 
            .status(400)
            .send({ errMessage: 'Workspace not found or you do not have access to it.' });
    }
	// Call the service to get all lists whose owner id matches the boardId
	await cardService.getAllCards(workspaceId,boardId,listId, userId, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const update = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId,boardId, listId, cardId } = req.params;
	// Call the card service
	 // Check if link and name are defined
	 if (!req.body || Object.keys(req.body).length === 0) {
		return res.status(400).json({ error: 'Request body must not be empty.' });
	  }
	await cardService.update(cardId, listId, boardId, workspaceId, user, req.body, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const deleteById = async (req, res) => {
	// deconstruct the params
	const user = req.user;
	const{ workspaceId, boardId, listId, cardId } = req.params;
	// Call the card service
	await cardService.deleteById(cardId, listId, boardId,  workspaceId,user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const addComment = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId,boardId, listId, cardId } = req.params;
	// Call the card service
	await cardService.addComment(cardId, listId, boardId, workspaceId, user, req.body, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const updateComment = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId,boardId, listId, cardId, commentId } = req.params;
	// Call the card service
	await cardService.updateComment(cardId, listId, boardId, commentId, workspaceId, user, req.body, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const deleteComment = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId,boardId, listId, cardId, commentId } = req.params;
	// Call the card service
	await cardService.deleteComment(cardId, listId, boardId, commentId, workspaceId, user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const addMember = async (req, res) => {
	// Get params
	const user = req.user;
	const { workspaceId, boardId, listId, cardId } = req.params;
	// Call the card service
	await cardService.addMember(cardId, listId, boardId, workspaceId,user, req.body.memberId, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const deleteMember = async (req, res) => {
	// Get params
	const user = req.user;
	const { workspaceId,boardId, listId, cardId, memberId } = req.params;
	// Call the card service
	await cardService.deleteMember(cardId, listId, boardId,workspaceId, user, memberId, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const createLabel = async (req, res) => {
	// Get paramsz
	const user = req.user;
	const { workspaceId, boardId, listId, cardId } = req.params;
	const label = req.body;
	// Call the card service
	await cardService.createLabel(cardId, listId, boardId, workspaceId, user, label, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const updateLabel = async (req, res) => {
	// Get params
	const user = req.user;
	const {workspaceId, boardId, listId, cardId, labelId } = req.params;
	const label = req.body;
	// Call the card service
	await cardService.updateLabel(cardId, listId, boardId, labelId, user, workspaceId, label, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const deleteLabel = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId, boardId, listId, cardId, labelId } = req.params;
	// Call the card service
	await cardService.deleteLabel(cardId, listId, boardId, labelId, workspaceId, user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const updateLabelSelection = async (req, res) => {
	// Get params
	const user = req.user;
	const {   workspaceId,boardId, listId, cardId, labelId } = req.params;
	const { selected } = req.body;
	// Call the card service
	await cardService.updateLabelSelection(cardId, listId, boardId, labelId,  workspaceId,user, selected, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const createChecklist = async (req, res) => {
	// Get params
	
	const user = req.user;

	const { workspaceId, boardId, listId, cardId } = req.params;

	console.log(re.params, 'request params...');

    const title = req.body.title;

	// Call the card service
	await cardService.createChecklist(cardId, listId, boardId,workspaceId, user, title, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const deleteChecklist = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId,boardId, listId, cardId, checklistId } = req.params;
	// Call the card service
	await cardService.deleteChecklist(cardId, listId, boardId, checklistId, workspaceId, user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const addChecklistItem = async (req, res) => {
	// Get params
	
	const user = req.user;
	const { workspaceId, boardId, listId, cardId, checklistId } = req.params;

	const text = req.body.text;
	// Call the card service
	await cardService.addChecklistItem(cardId, listId, boardId, workspaceId, user, checklistId, text, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};

// const addChecklistItem = async (req, res) => {
// 	try {
// 		const user = req.user;
// 		const { workspaceId, boardId, listId, cardId, checklistId } = req.params;
// 		const { text, selectedMembers } = req.body;

// 		// Validate input
// 		if (!text) {
// 			return res.status(400).json({ error: 'Checklist item text is required.' });
// 		}
// 		if (!selectedMembers || !Array.isArray(selectedMembers)) {
// 			return res.status(400).json({ error: 'Selected members must be an array.' });
// 		}

// 		// Call the card service directly without using callback
// 		const result = await cardService.addChecklistItem(
// 			cardId,
// 			listId,
// 			boardId,
// 			workspaceId,
// 			user,
// 			checklistId,
// 			text,
// 			selectedMembers
// 		);

// 		// Respond with success
// 		return res.status(200).json(result);
// 	} catch (error) {
// 		// Handle any errors
// 		return res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
// 	}
// };




const setChecklistItemCompleted = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId,boardId, listId, cardId, checklistId, checklistItemId } = req.params;
	const completed = req.body.completed;
	// Call the card service
	await cardService.setChecklistItemCompleted(
		cardId,
		listId,
		boardId,
		workspaceId,
		user,
		checklistId,
		checklistItemId,
		completed,
		(err, result) => {
			if (err) return res.status(500).send(err);
			return res.status(200).send(result);
		}
	);
};
const setChecklistItemText = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId,boardId, listId, cardId, checklistId, checklistItemId } = req.params;
	const text = req.body.text;
	if (!text) {
		return res.status(400).json({ error: 'Both link and name must be provided in the request body.' });
	  }
	// Call the card service
	await cardService.setChecklistItemText(
		cardId,
		listId,
		boardId,
		workspaceId,
		user,
		checklistId,
		checklistItemId,
		text,
		(err, result) => {
			if (err) return res.status(500).send(err);
			return res.status(200).send(result);
		}
	);
};
const deleteChecklistItem = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId, boardId, listId, cardId, checklistId, checklistItemId } = req.params;
	// Call the card service
	await cardService.deleteChecklistItem(
		cardId,
		listId,
		boardId,
		workspaceId,
		user,
		checklistId,
		checklistItemId,
		(err, result) => {
			if (err) return res.status(500).send(err);
			return res.status(200).send(result);
		}
	);
};
const updateStartDueDates = async (req, res) => {
	// Get params
	const user = req.user;
	const { workspaceId, boardId, listId, cardId } = req.params;
	const {startDate, dueDate, dueTime} = req.body;
	// Call the card service
	await cardService.updateStartDueDates(
		cardId,
		listId,
		boardId,
		workspaceId,
		user,
		startDate,
		dueDate,
		dueTime,
		(err, result) => {
			if (err) return res.status(500).send(err);
			return res.status(200).send(result);
		}
	);
};
const updateDateCompleted = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId,boardId, listId, cardId } = req.params;
	const {completed} = req.body;
	console.log("completed:",completed)
	// Call the card service
	await cardService.updateDateCompleted(
		cardId,
		listId,
		boardId,
		workspaceId,
		user,
		completed,
		(err, result) => {
			if (err) return res.status(500).send(err);
			return res.status(200).send(result);
		}
	);
};
const addAttachment = async (req, res) => {
	// Get params
	console.log("in the attechment route");
	const user = req.user;
	const {workspaceId, boardId, listId, cardId } = req.params;
	const {link,name} = req.body;
	if (!link || !name) {
		return res.status(400).json({ error: 'Both link and name must be provided in the request body.' });
	  }
	// Call the card service
	await cardService.addAttachment(
		cardId,
		listId,
		boardId,
		workspaceId,
		user,
		link,
		name,
		(err, result) => {
			if (err) return res.status(500).send(err);
			return res.status(200).send(result);
		}
	);
};
const deleteAttachment = async (req, res) => {
	// Get params
	const user = req.user;
	const { workspaceId,  boardId, listId, cardId, attachmentId } = req.params;
	// Call the card service
	await cardService.deleteAttachment(
		cardId,
		listId,
		boardId,
		workspaceId,
		user,
		attachmentId,
		(err, result) => {
			if (err) return res.status(500).send(err);
			return res.status(200).send(result);
		}
	);
};
const updateAttachment = async (req, res) => {
	// Get params
	const user = req.user;
	const {  workspaceId,boardId, listId, cardId, attachmentId } = req.params;
	const {link,name} = req.body;
	// Call the card service
	await cardService.updateAttachment(
		cardId,
		listId,
		boardId,
		workspaceId,
		user,
		attachmentId,
		link,
		name,
		(err, result) => {
			if (err) return res.status(500).send(err);
			return res.status(200).send(result);
		}
	);
};
const updateCover = async (req, res) => {
	// Get params
	const user = req.user;
	const { workspaceId, boardId, listId, cardId } = req.params;
	const {color, isSizeOne} = req.body;
	// Call the card service
	await cardService.updateCover(
		cardId,
		listId,
		boardId,
		workspaceId,
		user,
		color,
		isSizeOne,
		(err, result) => {
			if (err) return res.status(500).send(err);
			return res.status(200).send(result);
		}
	);
};
module.exports = {
	create,
	deleteById,
	getCard,
	getAllCards,
	update,
	addComment,
	updateComment,
	deleteComment,
	addMember,
	deleteMember,
	createLabel,
	updateLabel,
	deleteLabel,
	updateLabelSelection,
	createChecklist,
	deleteChecklist,
	addChecklistItem,
	setChecklistItemCompleted,
	setChecklistItemText,
	deleteChecklistItem,
	updateStartDueDates,
	updateDateCompleted,
	addAttachment,
	deleteAttachment,
	updateAttachment,
	updateCover,
};
