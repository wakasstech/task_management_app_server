const { findOne } = require('../modals/boardModel');
const boardModel = require('../modals/boardModel');
const userModel = require('../modals/userModel');
const cardModel = require('../modals/cardModel');
const listModel = require('../modals/listModel');
const workspaceModel = require('../modals/workspaceModel');
const Workspace = require('../modals/workspaceModel');
const create = async (req,  user ,  callback) => {
	try {
		const { title, backgroundImageLink, members , workspaceId } = req.body;
		// Create and save new board
		let newBoard = boardModel({ title, backgroundImageLink ,owner:workspaceId});
		newBoard.save();
		// Get owner workspace
		const ownerworkspace = await workspaceModel.findById(workspaceId);
		// Add newboard's id to owner workspace
		 await ownerworkspace.boards.push(newBoard.id);
		// Add this board to owner's workspace 
		await ownerworkspace.save();
		// Add user to members of this board
		let allMembers = []; 
		allMembers.push({
			user: user.id,
			name: user.name,
			surname: user.surname,
			email: user.email,
			color: user.color,
			role: 'owner',
		});
		//Save newBoard's id to boards of members and,
		// Add ids of members to newBoard
		console.log(members);
		// await Promise.all(
		// 	members.map(async (member) => {
		// 		const newMember = await userModel.findOne({ email: member.email });
		// 		newMember.boards.push(newBoard._id);
		// 	 	await newMember.save();
		// 		 allMembers.push({
		// 			user: newMember._id,
		// 			name: newMember.name,
		// 			surname: newMember.surname,
		// 			email: newMember.email,
		// 			color: newMember.color,
		// 			role: 'member',
		// 		});
		// 		//Add to board activity
		// 		newBoard.activity.push({
		// 			user: user.id,
		// 			name: user.name,
		// 			action: `added user '${newMember.name}' to this board`,
		// 		});
		// 	})
		// );
		//Add created activity to activities of this board
		newBoard.activity.unshift({ user: user._id, name: user.name, action: 'created this board', color: user.color });
		// Save new board
		newBoard.members = allMembers;
		await newBoard.save();
		return callback(false, newBoard);
	} catch (error) {
		return callback({
			errMessage: '',
			details: error.message,
		});
	}
};
// const getAll = async (userId,workspaceId, callback) => {
// 	try {
// 		console.log("workspace:",workspaceId);
// 		// Get workspace
// 		const workspace = await workspaceModel.findById(workspaceId);
// 		// Get user
// 		const user = await userModel.findById(userId);
// 		// Get board's ids of workspace
// 		const boardIds = workspace.boards;
// 		// Get boards of workspace
// 		const boards = await boardModel.find({ _id: { $in: boardIds } });
// 		// Delete unneccesary objects
// 		boards.forEach((board) => {
// 			board.activity = undefined;
// 			board.lists = undefined;
// 		});
// 		return callback(false, boards);
// 	} catch (error) {
// 		return callback({ msg: 'Something went wrong', details: error.message });
// 	}
// };
const getAll = async (userId, workspaceId, callback) => {
	try {
	  // Get workspace
	  const workspace = await workspaceModel.findById(workspaceId);
	  // Get user
	  const user = await userModel.findById(userId);
	  // Check if the user is the owner of the workspace
	  console.log("workspace owner-> :",workspace.owner);
	  console.log(" UserId-> :",userId);
	  const isOwner = workspace.owner.equals(userId);
  console.log("ownerValue:",isOwner);
	  // Get board's ids of workspace
	  const boardIds = workspace.boards;
	  // Define a filter to use in the query
	  let filter = { _id: { $in: boardIds}};
	  // If the user is not the owner and is a member of the workspace,
	  // add an additional filter to only show boards the user is a member of
	  if (!isOwner) {
		filter.members = { $elemMatch: { user: userId } };
	  }
	  // Get boards of the workspace based on the filter
	  const boards = await boardModel.find(filter);
	  // Delete unnecessary objects
	  boards.forEach((board) => {
		board.activity = undefined;
		board.lists = undefined;
	  });
	  return callback(false, boards);
	} catch (error) {
	  return callback({ msg: 'Something went wrong', details: error.message });
	}
  };
const getById = async (boardId, callback) => {
	try {
		// Get board by id
		const board = await boardModel.findById(boardId);
		return callback(false, board);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const getActivityById = async ( workspaceId, boardId, callback) => {
	try {
		const Workspace = await workspaceModel.findById(workspaceId);
        // Check if the boardId belongs to the found workspace
        const isBoardInWorkspace = Workspace.boards.find(board => board.toString() === boardId);
        if (!isBoardInWorkspace) {
            return callback({ message: 'The provided boardId is not associated with this workspace.'}); }
		// Get board by id
		const board = await boardModel.findById(boardId);
		return callback(false, board.activity);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const updateBoardTitle = async (workspaceId, boardId, title, user, callback) => {
    try {
        const Workspace = await workspaceModel.findById(workspaceId);    
        // Check if the boardId belongs to the found workspace
        const isBoardInWorkspace = Workspace.boards.find(board => board.toString() === boardId);
        if (!isBoardInWorkspace) {
            return callback({ message: 'The provided boardId is not associated with this workspace.' });
        }
        // Get board by id
        const board = await boardModel.findById(boardId);
        if (!board) {
            return callback({message: 'Board not found.' });
        }
        board.title = title;
        board.activity.unshift({
            user: user._id,
            name: user.name,
            action: 'update title of this board',
            color: user.color,
        });
        await board.save();
        return callback(false, { message: 'Success!' });
    } catch (error) {
        return callback({ message: 'Something went wrong', details: error.message });
    }
};
const updateBoardDescription = async ( workspaceId,boardId, description, user, callback) => {
	try {
		const Workspace = await workspaceModel.findById(workspaceId);
        // Check if the boardId belongs to the found workspace
        const isBoardInWorkspace = Workspace.boards.find(board => board.toString() === boardId);
        if (!isBoardInWorkspace) {
            return callback({ message: 'The provided boardId is not associated with this workspace.' }); }
		// Get board by id
		const board = await boardModel.findById(boardId);
		board.description = description;
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: 'update description of this board',
			color: user.color,
		});
		await board.save();
		return callback(false,{ message:'Success!'});
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const updateBackground = async (workspaceId, boardId, background, isImage, user, callback) => {
	try {
		const Workspace = await workspaceModel.findById(workspaceId);
        // Check if the boardId belongs to the found workspace
        const isBoardInWorkspace = Workspace.boards.find(board => board.toString() === boardId);
        if (!isBoardInWorkspace) {
            return callback({ message: 'The provided boardId is not associated with this workspace.' });}
		// Get board by id
		const board = await boardModel.findById(boardId);
		// Set variables
		board.backgroundImageLink = background;
		board.isImage = isImage;
		// Log the activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: 'update background of this board',
			color: user.color,
		});
		// Save changes
		await board.save();
		return callback(false, board);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const addMember = async (workspaceId, id, members, user, callback) => {
    try {
        const board = await boardModel.findById(id);
        const workspace = await workspaceModel.findById(workspaceId);
        const workspaceIdmatch = user.workspaces.find(workspace => workspace.toString() === workspaceId);
        const boardIdmatch = workspace.boards.find(board => board.toString() === id);
		console.log(boardIdmatch);
        if (!(workspaceIdmatch && boardIdmatch)) {
            return callback({ message: 'You cannot add a member to this board, you are not a member or owner!' });
        }
        // Create an array to collect errors during the loop
        const errors = [];
        await Promise.all(
            members.map(async (member) => {
                const newMember = await userModel.findOne({ email: member.email });
                if (!newMember) {
                    errors.push({ message: `Member with email '${member.email}' does not exist.` });
                    return; // Skip to the next member
                }
                const isMemberOfThisWorkspace = newMember.workspaces.find(workspace => workspace.toString() === workspaceId.toString());
				console.log(!(isMemberOfThisWorkspace))
                if (!(isMemberOfThisWorkspace)) {
                    errors.push({ message: 'To add a member to the board, they should also be a member of Parent workspace!' });
                    return; // Skip to the next member
                }
                const newMemberWorkspace = await workspaceModel.findById(isMemberOfThisWorkspace);
				const isMemberAlreadyPresent = board.members.some(member => 
					 member.user.toString() === newMember._id.toString());
			
				if (isMemberAlreadyPresent) {
                    errors.push({ message: `Member with email '${newMember.email}' is already a member of this board.` });
                    return; // Skip to the next member
                }
                newMemberWorkspace.boards.push(board._id);
                await newMemberWorkspace.save();
                board.members.push({
                    user: newMember._id,
                    name: newMember.name,
                    surname: newMember.surname,
                    email: newMember.email,
                    color: newMember.color,
                    role: 'member',
                });
                board.activity.push({
                    user: user.id,
                    name: user.name,
                    action: `added user '${newMember.name}' to this board`,
                    color: user.color,
                });
            })
        );
        // After the loop, check if there are errors and return them if any
        if (errors.length > 0) {
            return callback(errors);
        }
        // Save changes
        await board.save();
        return callback(null, board.members);
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        return callback({ message: 'Something went wrong', details: error.message });
    }
};
const deleteMember = async (workspaceId, boardId, memberId, user, callback) => {
	try {
	  // Get the board by boardId
	  const board = await boardModel.findById(boardId);
	  const workspace = await workspaceModel.findById(workspaceId);
	  // Find the workspace object based on the matching workspaceId
	  const workspaceIdMatch = user.workspaces.find((workspace) => workspace.toString() === workspaceId.toString());
	  console.log("boards of this workspace:",workspace.boards)
	  const boardIdMatch = workspace.boards.find((board) => board.toString() === boardId);
	  if (!(workspaceIdMatch && boardIdMatch)) {
		return callback({ message: 'You cannot delete a member from this board; you are not a member or owner!' });
	  }
	  console.log("BoardIdMatch:",boardIdMatch);
	  console.log("WspaceIdMatch->",workspaceIdMatch);
	
	  // Check if the member with memberId exists in the board's members
	  const memberIndex = board.members.findIndex((member) => member.user.toString() === memberId.toString());
	  if (memberIndex === -1) {
		return callback({ message: 'The specified member is not part of this board.' });
	  }
	  // Remove the member from the board's members array
	  const removedMember = board.members.splice(memberIndex, 1)[0];
	  // Remove the member from the board's lists and child cards' memberships
	  for (const listId of board.lists) {
		console.log(" list of this board",listId)
		const list = await listModel.findById(listId);
		// Remove the member from the list's members
		const listMemberIndex = list.members.findIndex((listMember) => listMember.user.toString() === memberId.toString());
		if (listMemberIndex !== -1) {
		  list.members.splice(listMemberIndex, 1);
		}
		for (const cardId of list.cards) {
		  // Remove the member from the card's members
		  const card = await cardModel.findById(cardId);
		  const cardMemberIndex = card.members.findIndex((cardMember) => cardMember.user.toString() === memberId.toString());
		
		  if (cardMemberIndex !== -1) {
			card.members.splice(cardMemberIndex, 1);
			card.save();
		  }
		}
		await list.save();
	  }
	  // Add an activity entry for the deletion
	  board.activity.push({
		user: user.id,
		name: user.name,
		action: `removed user '${removedMember.name}' from this board`,
		color: user.color,
	  });
	  // Save the board with the updated member list and memberships
	  await board.save();
	  return callback(null, board.members);
	} catch (error) {
	  console.error(error); // Log the error for debugging purposes
	  return callback({ message: 'Something went wrong', details: error.message });
	}
  };
const deleteById = async ( boardId, workspaceId,user, callback) => {
	try {
		// Get board to check the parent of board is this workspace
		const board = await boardModel.findById(boardId);
	if (board==null) return res.status(400).send({ errMessage: ' your board not found in  workspace boards' });
		// Get workspace to check the parent of board is this workspace
		const workspace = await workspaceModel.findById(workspaceId);
		 const validate = workspace.boards.filter((board) => board === boardId);
		 console.log("workspace",validate);
		if (!validate)
			return res.status(400).send({ errMessage: 'You can not delete the this board, you are not a member or owner!' });
		 console.log("hi workspace",workspace);
		// Delete the  booard
		const result = await boardModel.findByIdAndDelete(boardId);
		 // Delete the board from boards of workspace
              workspace.boards =  await workspace.boards.filter((board) =>board.toString() !==boardId);
		        await workspace.save();
// Delete all the cards associated with the lists on this board
		const listIds = board.lists.map(list => list.toString());
		await cardModel.deleteMany({ owner: { $in: listIds } });
// Delete all lists in the board
		await listModel.deleteMany({ owner: boardId });
		return callback(false, result);
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
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
