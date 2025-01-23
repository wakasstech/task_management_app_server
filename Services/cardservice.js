const cardModel = require('../modals/cardModel');
const listModel = require('../modals/listModel');
const boardModel = require('../modals/boardModel');
const userModel = require('../modals/userModel');
const workspaceModel = require('../modals/workspaceModel');
const helperMethods = require('./helperMethods');
const create = async ( workspaceId,title, listId, boardId, user, callback) => {
	try {
		// Get list and board and workspace
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate the ownership
		const validate = await helperMethods.validateCardOwners(null, list, board, workspace, true);
		if (!validate) return callback({ errMessage: 'You dont have permission to add card to this list or board' });
		// Create new card
		const card = await cardModel({ title: title });
		card.owner = listId;
		card.activities.unshift({ text: `added this card to ${list.title}`, userName: user.name, color: user.color });
		card.members.unshift({ user: user._id, 
			name: user.name,
			surname:user.surname,
			email:user.email,
			 color: user.color ,
			 role: "owner"});
		card.labels = helperMethods.labelsSeed;
		await card.save();
		// Add id of the new card to owner list
		list.cards.push(card._id);
		await list.save();
		// Add log to board activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: `added ${card.title} to this board`,
			color: user.color,
		});
		await board.save();
		// Set data transfer object
		const result = await listModel.findById(listId).populate({ path: 'cards' }).exec();
		return callback(false, result);
	} catch (error) {
		return callback({ errMessage: 'Something went wrong  this one', details: error.message });
	}
};
const getCard = async ( workspaceId,cardId, listId, boardId, user, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners( card, list,  board,workspace , user, false);
		
		if (!validate) {
			return callback({  errMessage: 'You dont have permission to access this card' });
		}
		let returnObject = { ...card._doc, listTitle: list.title, listId: listId, boardId: boardId };
		return callback(false, returnObject);
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const getAllCards = async ( workspaceId, boardId,listId, userId, callback) => {
	try {
// Get  modals
	  const workspace = await workspaceModel.findById(workspaceId);
	   const board = await boardModel.findById(boardId);
       const list = await listModel.findById(listId);
	  const user = await userModel.findById(userId);
 // Check if the user is the owner of the workspace
	  console.log("workspace owner-> :",workspace.owner);
	  console.log(" UserId-> :",userId);
	  const isOwner = workspace.owner.equals(userId);
 // Get cards's ids of list
	  const cardIds = list.cards;
	  // Define a filter to use in the query
	  let filter = { _id: { $in: cardIds}};
 // If the user is not the owner and is a member of the workspace,
	  // add an additional filter to only show lists the user is a member of

	  if (!isOwner) {
		filter.members = { $elemMatch: { user: userId } };
		console.log("userId->",userId)
	  }
	  console.log("filter Value:",filter);
		 // Get cards of the list based on the filter
	//   const cards = await cardModel.find(filter).populate({ path: 'cards' }).exec();
	const cards = await cardModel.find(filter);
	
		return callback(false, cards);
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const deleteById = async ( cardId, listId, boardId, workspaceId, user, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update this card';
		}
		 // Find the workspace object based on the matching workspaceId
 const cardAvalaible= list.cards.find(card => card.toString() === cardId);
  if (!cardAvalaible) {
	 const errorMessage = 'card information is not correct or card not found';
	 return callback({ errMessage: errorMessage });
 }
		// Delete the card
		const result = await cardModel.findByIdAndDelete(cardId);
		// Delete the card from cards of list
		list.cards = list.cards.filter((tempCard) => tempCard.toString() !== cardId);
		await list.save();
		// Add activity log to board
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: `deleted ${result.title} from ${list.title}`,
			color: user.color,
		});
		await board.save();
		return callback(false, { message: 'Success' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const update = async (cardId, listId, boardId, workspaceId, user, updatedObj, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update this card';
		}
		//Update card
		await card.updateOne(updatedObj);
		await card.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const addComment = async (cardId, listId, boardId, workspaceId, user, body, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update this card';
		}
		//Add comment
		card.activities.unshift({
			text: body.text,
			userName: user.name,
			isComment: true,
			color: user.color,
		});
		await card.save();
		//Add comment to board activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: body.text,
			actionType: 'comment',
			cardTitle: card.title,
			color: user.color,
		});
		board.save();
		return callback(false, card.activities);
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const updateComment = async (cardId, listId, boardId, commentId, workspaceId, user, body, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update this card';
		}
		//Update card
		card.activities = card.activities.map((activity) => {
			if (activity._id.toString() === commentId.toString()) {
				if (activity.userName !== user.name) {
					return callback({ errMessage: "You can not edit the comment that you hasn't" });
				}
				activity.text = body.text;
			}
			return activity;
		});
		await card.save();
		//Add to board activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: body.text,
			actionType: 'comment',
			edited: true,
			color: user.color,
			cardTitle: card.title,
		});
		board.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const deleteComment = async (cardId, listId, boardId, commentId, workspaceId,user, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update this card';
		}
		//Delete card
		card.activities = card.activities.filter((activity) => activity._id.toString() !== commentId.toString());
		await card.save();
		//Add to board activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: `deleted his/her own comment from ${card.title}`,
			color: user.color,
		});
		board.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
// const addMember = async (cardId, listId, boardId, workspaceId, user, memberId, callback) => {
// 	try {
// 		// Get models
// 		const card = await cardModel.findById(cardId);
// 		const list = await listModel.findById(listId);
// 		const board = await boardModel.findById(boardId);
// 		const member = await userModel.findById(memberId);
// 		const workspace = await workspaceModel.findById(workspaceId);
// 		// Validate owner
// 		const validate = await helperMethods.validateCardOwners(card, list, board, workspace, user, false);
// 		if (!validate) {
// 			errMessage: 'You dont have permission to add member this card';
// 		}
// 		//Add member
// 		card.members.unshift({
// 			user: member._id,
// 			name: member.name,
// 			color: member.color,
// 			role: "member"
// 		});
// 		await card.save();
// 		//Add to board activity
// 		board.activity.unshift({
// 			user: user._id,
// 			name: user.name,
// 			action: `added '${member.name}' to ${card.title}`,
// 			color: user.color,
// 		});
// 		board.save();

// 		return callback(false, { message: 'success' });
// 	} catch (error) {
// 		return callback({ errMessage: 'Something went wrong', details: error.message });
// 	}
// };
const addMember = async (cardId, listId, boardId, workspaceId, user, memberId, callback) => {
    try {
        // Get models
        const card = await cardModel.findById(cardId);
        const list = await listModel.findById(listId);
        const board = await boardModel.findById(boardId);
        const member = await userModel.findById(memberId);
        const workspace = await workspaceModel.findById(workspaceId);
        // Validate owner
        const validate = await helperMethods.validateCardOwners(card, list, board, workspace, user, false);
        if (!validate) {
            return callback({ errMessage: "You don't have permission to add a member to this card" });
        }
        // Check if the member is already in the card's members
        const existingMember = card.members.find((m) => m.user.equals(member._id));
        if (existingMember) {
            return callback({ errMessage: "Member already exists in this card" });
        }
 // Check if the member is in the parent list's members
 const listMember = list.members.find((m) => m.user.equals(member._id));
 console.log("listMember->",listMember);
 if (!listMember) {
	 return callback({ errMessage: "To add a member to this card, the member should be added to the parent list as well" });
 }
        // Add member
        card.members.unshift({
            user: member._id,
            name: member.name,
			surname: member.surname,
            email: member.email,
            color: member.color,
            role: "member"
        });
        await card.save();
        // Add to board activity
        board.activity.unshift({
            user: user._id,
            name: user.name,
            action: `added '${member.name}' to ${card.title}`,
            color: user.color,
        });
        await board.save();
        return callback(false, { message: "success" });
    } catch (error) {
        return callback({ errMessage: "Something went wrong", details: error.message });
    }
};




const deleteMember = async (cardId, listId, boardId,  workspaceId,user, memberId, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to add member this card';
		}
		 // Check if the member exists in the card's members
		 const existingMemberIndex = card.members.findIndex((a) => a.user.toString() === memberId.toString());
		 if (existingMemberIndex === -1) {
			 return callback({ errMessage: "Member not found in this card" });
		 }
		//delete member
		card.members = card.members.filter((a) => a.user.toString() !== memberId.toString());
		await card.save();
		//get member
		const tempMember = await userModel.findById(memberId);
		//Add to board activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action:
				tempMember.name === user.name
					? `left ${card.title}`
					: `removed '${tempMember.name}' from ${card.title}`,
			color: user.color,
		});
		board.save();
		return callback(false, { message: 'success' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const createLabel = async (cardId, listId, boardId,workspaceId, user, label, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace,user, false);
		if (!validate) {
			errMessage: 'You dont have permission to add label this card';
		}
		//Add label
		card.labels.unshift({
			text: label.text,
			color: label.color,
			backcolor: label.backColor,
			selected: true,
		});
		await card.save();
		const labelId = card.labels[0]._id;
		return callback(false, { labelId: labelId });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const updateLabel = async (cardId, listId, boardId, labelId, user,workspaceId, label, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update this card';
		}
		//Update label
		card.labels = card.labels.map((item) => {
			if (item._id.toString() === labelId.toString()) {
				item.text = label.text;
				item.color = label.color;
				item.backColor = label.backColor;
			}
			return item;
		});
		await card.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const deleteLabel = async (cardId, listId, boardId, labelId, workspaceId, user, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to delete this label';
		}
		//Delete label
		card.labels = card.labels.filter((label) => label._id.toString() !== labelId.toString());
		await card.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const updateLabelSelection = async (cardId, listId, boardId, labelId, workspaceId, user, selected, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace,user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update this card';
		}
		//Update label
		card.labels = card.labels.map((item) => {
			if (item._id.toString() === labelId.toString()) {
				item.selected = selected;}
			return item;
		});
		await card.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const createChecklist = async (cardId, listId, boardId, workspaceId, user, title, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to add Checklist this card';
		}
		//Add checklist
		card.checklists.push({
			title: title,
		});
		await card.save();
		const checklistId = card.checklists[card.checklists.length - 1]._id;
		//Add to board activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: `added '${title}' to ${card.title}`,
			color: user.color,
		});
		board.save();
		return callback(false, { checklistId: checklistId });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const deleteChecklist = async (cardId, listId, boardId, checklistId, workspaceId, user, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to delete this checklist';
		}
		let cl = card.checklists.filter((l) => l._id.toString() === checklistId.toString());
		//Delete checklistl
		card.checklists = card.checklists.filter((list) => list._id.toString()!== checklistId.toString());
		await card.save();
		//Add to board activity
		board.activity.unshift({
			user: user._id,  
			name: user.name,
			action: `removed '${cl.title}' from ${card.title}`,
			color: user.color,
		});
		board.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const addChecklistItem = async (cardId, listId, boardId,  workspaceId,user, checklistId, text, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to add item this checklist';
		}
		//Add checklistItem
		card.checklists = card.checklists.map((list) => {
			if (list._id.toString() == checklistId.toString()) {
				list.items.push({ text: text });
			}
			return list;
		});
		await card.save();
		// Get to created ChecklistItem's id
		let checklistItemId = '';
		card.checklists = card.checklists.map((list) => {
			if (list._id.toString() == checklistId.toString()) {
				checklistItemId = list.items[list.items.length - 1]._id;
				console.log("values:",list.items[list.items.length - 1])
			}
			return list;
		});
		return callback(false, { checklistItemId: checklistItemId });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
// const addChecklistItem = async (cardId, listId, boardId, workspaceId, user, checklistId, text, selectedMembers) => {
// 	try {
// 		// Fetch the required models
// 		const card = await cardModel.findById(cardId);
// 		const list = await listModel.findById(listId);
// 		const board = await boardModel.findById(boardId);
// 		const workspace = await workspaceModel.findById(workspaceId);

// 		// Validate if user has permission to modify the card
// 		const isAuthorized = await helperMethods.validateCardOwners(card, list, board, workspace, user, false);
// 		if (!isAuthorized) {
// 			throw new Error('You don’t have permission to add items to this checklist.');
// 		}

// 		// Find the relevant checklist and add the new item with text and selected members
// 		let checklistFound = false;
// 		card.checklists = card.checklists.map((list) => {
// 			if (list._id.toString() === checklistId.toString()) {
// 				list.items.push({
// 					text: text,
// 					members: selectedMembers, // Add members to the checklist item
// 				});
// 				checklistFound = true;
// 			}
// 			return list;
// 		});

// 		if (!checklistFound) {
// 			throw new Error('Checklist not found.');
// 		}

// 		// Save the card with the updated checklist
// 		await card.save();

// 		// Retrieve the newly created checklist item ID
// 		let checklistItemId;
// 		card.checklists.forEach((list) => {
// 			if (list._id.toString() === checklistId.toString()) {
// 				checklistItemId = list.items[list.items.length - 1]._id;
// 			}
// 		});

// 		// Return the result with the new checklist item ID and selected members
// 		return { checklistItemId: checklistItemId, selectedMembers: selectedMembers };
// 	} catch (error) {
// 		// Throw the error so it can be caught in the controller
// 		throw new Error(`Something went wrong while adding the checklist item: ${error.message}`);
// 	}
// };



const setChecklistItemCompleted = async (
	cardId,
	listId,
	boardId,
	workspaceId,
	user,
	checklistId,
	checklistItemId,
	completed,
	callback
) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,  workspace,user, false);
		if (!validate) {
			errMessage: 'You dont have permission to set complete of this checklist item';
		}
		let clItem = '';
		//Update completed of checklistItem
		card.checklists = card.checklists.map((list) => {
			if (list._id.toString() == checklistId.toString()) {
				list.items = list.items.map((item) => {
					if (item._id.toString() === checklistItemId) {
						item.completed = completed;
						clItem = item.text;
					}
					return item;
				});
			}
			return list;
		});
		await card.save();
		//Add to board activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: completed
				? `completed '${clItem}' on ${card.title}`
				: `marked as uncompleted to '${clItem}' on ${card.title}`,
			color: user.color,
		});
		board.save();

		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const setChecklistItemText = async (cardId, listId, boardId, workspaceId, user, checklistId, checklistItemId, text, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to set text of this checklist item';
		}

		//Update text of checklistItem
		card.checklists = card.checklists.map((list) => {
			if (list._id.toString() == checklistId.toString()) {
				list.items = list.items.map((item) => {
					if (item._id.toString() === checklistItemId) {
						item.text = text;
					}
					return item;
				});
			}
			return list;
		});
		await card.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const deleteChecklistItem = async ( cardId, listId, boardId,   workspaceId,user, checklistId, checklistItemId, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace,user, false);
		if (!validate) {
			errMessage: 'You dont have permission to delete this checklist item';
		}
		//Delete checklistItem
		card.checklists = card.checklists.map((list) => {
			if (list._id.toString() == checklistId.toString()) {
				list.items = list.items.filter((item) => item._id.toString() !== checklistItemId);
			}
			return list;
		});
		await card.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};

const updateStartDueDates = async (cardId, listId, boardId ,workspaceId, user, startDate, dueDate, dueTime, callback) => {
	try {
		// Get models
	
	
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace,user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update date of this card';
		}
		//Update dates
		card.date.startDate = startDate;
		card.date.dueDate = dueDate;
		card.date.dueTime = dueTime;
		console.log("DATE OF CARD",card.date);
		if (dueDate === null) card.date.completed = false;
		await card.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const updateDateCompleted = async (cardId, listId, boardId, workspaceId, user, completed, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update date of this card';
		}
		//Update date completed event
		card.date.completed = completed;
		await card.save();
		//Add to board activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: `marked the due date on ${card.title} ${completed ? 'complete' : 'uncomplete'}`,
			color: user.color,
		});
		board.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const addAttachment = async (cardId, listId, boardId, workspaceId, user, link, name, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update date of this card';
		}

		//Add attachment
		const validLink = new RegExp(/^https?:\/\//).test(link) ? link : 'http://' + link;
		card.attachments.push({ link: validLink, name: name });
		await card.save();

		//Add to board activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: `attached ${validLink} to ${card.title}`,
			color: user.color,
		});
		board.save();

		return callback(false, { attachmentId: card.attachments[card.attachments.length - 1]._id.toString() });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};

const deleteAttachment = async (cardId, listId, boardId, workspaceId, user, attachmentId, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board,   workspace ,user, false);
		if (!validate) {
			errMessage: 'You dont have permission to delete this attachment';
		}

		let attachmentObj = card.attachments.filter(
			(attachment) => attachment._id.toString() === attachmentId.toString()
		);

		//Delete checklistItem
		card.attachments = card.attachments.filter(
			(attachment) => attachment._id.toString() !== attachmentId.toString()
		);
		await card.save();

		//Add to board activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: `deleted the ${attachmentObj[0].link} attachment from ${card.title}`,
			color: user.color,
		});
		board.save();

		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};

const updateAttachment = async (cardId, listId, boardId,  workspaceId,user, attachmentId, link, name, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace, user,  false);
		if (!validate) {
			errMessage: 'You dont have permission to update attachment of this card';
		}
		//Update date completed event
		card.attachments = card.attachments.map((attachment) => {
			if (attachment._id.toString() === attachmentId.toString()) {
				attachment.link = link;
				attachment.name = name;
			}
			return attachment;
		});
		await card.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const updateCover = async (cardId, listId, boardId, workspaceId, user, color, isSizeOne, callback) => {
	try {
		// Get models
		const card = await cardModel.findById(cardId);
		const list = await listModel.findById(listId);
		const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		// Validate owner
		const validate = await helperMethods.validateCardOwners(card, list, board, workspace, user, false);
		if (!validate) {
			errMessage: 'You dont have permission to update attachment of this card';
		}
		//Update date cover color
		card.cover.color = color;
		card.cover.isSizeOne = isSizeOne;
		await card.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
module.exports = {
	create,
	update,
	getCard,
	getAllCards,
	addComment,
	deleteById,
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