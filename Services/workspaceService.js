const boardModel = require('../modals/boardModel');
const userModel = require('../modals/userModel');
const cardModel = require('../modals/cardModel');
const listModel = require('../modals/listModel');
const workspaceModel = require('../modals/workspaceModel');
const create = async (req, callback) => {
	try {
        const { name, type, description } = req.body;
		// Create and save new board
		let newworkspace = workspaceModel({ name, type, description,owner:req.user._id});
		newworkspace.save();
		// Add this board to owner's boards
		console.log(req.user.id)
		const user = await userModel.findById(req.user.id);
		console.log(user)
		if (!user) {
			return callback({
				errMessage: 'User not found',
			});
		}
		user.workspaces.unshift(newworkspace.id);
		await user.save();
		// Add user to members of this workspace
		let allMembers = []; 
		allMembers.push({
			user: user.id,
			name: user.name,
			surname: user.surname,
			email: user.email,
			color: user.color,
			role: 'owner',
		});
		// // Save newBoard's id to boards of members and,
		// // Add ids of members to newBoard
		// console.log(members);
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
		// Add created activity to activities of this board
	//	newBoard.activity.unshift({ user: user._id, name: user.name, action: 'created this board', color: user.color });
		// Save new board
		newworkspace.members = allMembers;
		await newworkspace.save();
		return callback(false, newworkspace);
	} catch (error) {
		return callback({
			errMessage: '',
			details: error.message,
		});
	}
};
// const getWorkspaces = async (userId, callback) => {
// 	console.log(userId)
// 	try {
// 		// Get user
// 		const user = await userModel.findById(userId);
// 		// Get workspace's ids of user
// 		const workspaceIds = user.workspaces;
// 		// Get boards of user
// 		const workspaces = await workspaceModel.find({ _id: { $in: workspaceIds } });
// 		return callback(false, workspaces);
// 	} catch (error) {
// 		return callback({ msg: 'Something went wrong', details: error.message });
// 	}
// };
const getWorkspaces = async (userId, callback) => {
	try {
	  // Get user
	  const user = await userModel.findById(userId);
	  // Get workspace's ids of user
	  const workspaceIds = user.workspaces;
	  // Define a filter to use in the query
	  let filter = { _id: { $in: workspaceIds } };
	  // Check if the user is the owner of any of the workspaces
	  const ownedWorkspaces = await workspaceModel.find({ _id: { $in: workspaceIds }, owner: userId });
	  if (ownedWorkspaces.length === 0) {
		// If the user is not the owner of any workspaces, add an additional filter to only show workspaces where the user has a membership role
		filter.members = { $elemMatch: { user: userId } };
	  }
	  // Get workspaces based on the filter
	  const workspaces = await workspaceModel.find(filter);
	  return callback(false, workspaces);
	} catch (error) {
	  return callback({ msg: 'Something went wrong', details: error.message });
	}
  };
const getWorkspace = async (id, callback) => {
	try {
		console.log(" in the workspaceService  ");
		// Get board by id
		const workspace = await workspaceModel.findById(id);
		return callback(false, workspace);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const updateWorkspaceName = async (wsId, name, user, callback) => {
	try {
		// Get board by id
		const workspace = await workspaceModel.findById(wsId);
		workspace.name = name;
		await workspace.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const updateWorkspaceDescription = async (workspaceId, description, user, callback) => {
	try {
		// Get workspace by id
		const workspace = await workspaceModel.findById(workspaceId);
		workspace.description = description;
		await workspace.save();
		return callback(false, { message: 'Success!'});
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
// api testing #1
const newAddMember = async (workspaceId, memberId, boardIds, listIds, cardIds,user, callback) => {
	try {
	  // Get the workspace by workspaceId
	  const workspace = await workspaceModel.findById(workspaceId);
	  const newMember = await userModel.findById(memberId);
	  // Check if the member with memberId exists in the workspace's members
	  console.log("new member name",newMember.name);
	  const memberExists = workspace.members.some((member) => member.user.toString() === memberId.toString());
	  if (!memberExists) {
		// If the member doesn't exist in the workspace, add them
		workspace.members.push({ user: memberId,
			name: newMember.name,
			surname: newMember.surname,
			email: newMember.email,
		    color: newMember.color
		 });
		await workspace.save();
		   // Add the workspace to the newMember's workspaces array
		   newMember.workspaces.push(workspaceId);

		   await newMember.save();
	  }
	  // Add the member to the selected boards
	  for (const boardId of boardIds) {
		const board = await boardModel.findById(boardId);
		// Check if the member is already in the board's members
		const boardMemberExists = board.members.some((boardMember) => boardMember.user.toString() === memberId.toString());
		if (!boardMemberExists) {
		  board.members.push({ user: memberId,
			name: newMember.name,
			surname: newMember.surname,
			email: newMember.email,
		    color: newMember.color
		 });
		  await board.save();
		}
		// Add the member to the selected lists within the board
		for (const listId of listIds) {
		  const list = await listModel.findById(listId);
		  // Check if the member is already in the list's members
		  const listMemberExists = list.members.some((listMember) => listMember.user.toString() === memberId.toString());
		  if (!listMemberExists) {
			list.members.push({ user: memberId,
				name: newMember.name,
				surname: newMember.surname,
				email: newMember.email,
				color: newMember.color
			 });
			await list.save();
		  }
		  // Add the member to the selected cards within the list
		  for (const cardId of cardIds) {
			const card = await cardModel.findById(cardId);
			// Check if the member is already in the card's members
			const cardMemberExists = card.members.some((cardMember) => cardMember.user.toString() === memberId.toString());
			if (!cardMemberExists) {
			  card.members.push({ user: memberId,
				name: newMember.name,
				surname: newMember.surname,
				email: newMember.email,
				color: newMember.color
			 });
			  await card.save();
			}
		  }
		}
	  }
	  callback(null, { message: 'Member added successfully.' });
	} catch (error) {
	  callback(error, null);
	}
  };
// #2
// const newAddMember = async (workspaceId, memberId, boardIds, listIds, cardIds, user, callback) => {
// 	try {
// 	  let errorOccurred = false; // Flag to track if an error occurred
// 	  // Get the workspace by workspaceId
// 	  const workspace = await workspaceModel.findById(workspaceId);
// 	  const newMember = await workspaceModel.findById(memberId);
// 	  // Check if the member with memberId exists in the workspace's members
// 	  const memberExistsInWorkspace = workspace.members.some((member) => member.user.toString() === memberId.toString());
// 	  if (memberExistsInWorkspace) {
// 		errorOccurred = true; // Set the flag to true if an error occurs
// 		callback({ message: `Member already exists in '${workspace.name}'.` });
// 	  }
// 	  if (!memberExistsInWorkspace) {
// 		// If the member doesn't exist in the workspace, add them
// 		workspace.members.push({ user: memberId });
// 		await workspace.save();
// 	  }
// 	  // Add the member to the selected boards
// 	  for (const boardId of boardIds) {
// 		const board = await boardModel.findById(boardId);
  
// 		// Check if the member is already in the board's members
// 		const memberExistsInBoard = board.members.some((boardMember) => boardMember.user.toString() === memberId.toString());
  
// 		if (memberExistsInBoard) {
// 		  errorOccurred = true; // Set the flag to true if an error occurs
// 		  callback({ message: `Member already exists in '${board.title}'.` });
// 		}
// 		if (!memberExistsInBoard) {
// 		  board.members.push({ user: memberId });
// 		  await board.save();
// 		}
// 		}
// 	// Add the member to the selected lists within the board
// 	for (const listId of listIds) {
// 		const list = await listModel.findById(listId);

// 		// Check if the member is already in the list's members
// 		const memberExistsInList = list.members.some((listMember) => listMember.user.toString() === memberId.toString());

// 		if (memberExistsInList) {
// 		  errorOccurred = true; // Set the flag to true if an error occurs
// 		  callback({ message: `Member already exists in '${list.title}'.` });
// 		}

// 		if (!memberExistsInList) {
// 		  list.members.push({ user: memberId });
// 		  await list.save();
// 		}




// 	  }
//       // Add the member to the selected cards within the list
// 		  for (const cardId of cardIds) {
// 			const card = await cardModel.findById(cardId);
  
// 			// Check if the member is already in the card's members
// 			const memberExistsInCard = card.members.some((cardMember) => cardMember.user.toString() === memberId.toString());
  
// 			if (memberExistsInCard) {
// 			  errorOccurred = true; // Set the flag to true if an error occurs
// 			  callback({ message: `Member already exists in '${card.title}'.` });
// 			}
  
// 			if (!memberExistsInCard) {
// 			  card.members.push({ user: memberId });
// 			  await card.save();
// 			}
// 		  }
		
// 	  // If no errors occurred, return the success message
// 	  if (!errorOccurred) {
// 		callback(null, { message: 'Member added successfully.' });
// 	  }
// 	} catch (error) {
// 	  callback(error, null);
// 	}
//   };
  


const addMember = async (id, members, user, callback) => {
    let callbackCalled = false; // Flag to track if the callback has been called
    try {
        // Get workspace by id
        const workspace = await workspaceModel.findById(id);
        // Set variables
        await Promise.all(
            members.map(async (member) => {
                const newMember = await userModel.findOne({ email: member.email });
                // Check if the member is already in the workspace
                const isMemberAlreadyPresent = workspace.members.some((existingMember) =>
                    existingMember.user.equals(newMember._id)
                );
                if (isMemberAlreadyPresent) {
                    // If the member is already present, send a custom error
                    if (!callbackCalled) {
                        callback({ message: `Member with email '${member.email}' is already a member of this workspace.` });
                        callbackCalled = true; // Mark the callback as called
                    }
                } else {
                    // If the member is not already present, add them to the workspace
                    newMember.workspaces.push(workspace._id);
                    await newMember.save();
                    workspace.members.push({
                        user: newMember._id,
                        name: newMember.name,
                        surname: newMember.surname,
                        email: newMember.email,
                        color: newMember.color,
                        role: 'member',
                    });
                }
            })
        );
        // Save changes
        await workspace.save();
        if (!callbackCalled) {
            callback(false, workspace.members);
            callbackCalled = true; // Mark the callback as called
        }
    } catch (error) {
        if (!callbackCalled) {
            callback({ message: 'Something went wrong', details: error.message });
            callbackCalled = true; // Mark the callback as called
        }
    }
};
const deleteMember = async (workspaceId, memberId, user, callback) => {
	try {
	  // Get the workspace by boardId
	  console.log("workspace->",workspaceId)
	  const workspace = await workspaceModel.findById(workspaceId);
	 console.log("workspace->",workspace)
	  // Check if the member with memberId exists in the workspace's members
	  const memberIndex = workspace.members.findIndex((member) => member.user.toString() === memberId.toString());
	  if (memberIndex === -1) {
		return callback({ message: 'The specified member is not part of this  workspace.' });
	  }
	  // Remove the member from the workspace's members array
	  const removedMember = workspace.members.splice(memberIndex, 1)[0];
	   // Remove the workspace from the user's workspaces
	   console.log("removed member->",removedMember.user);
	//get full  removed member
	const removeduser = await  userModel.findById(removedMember.user);
	console.log("removed user->",removeduser);
	   const userIndex = removeduser.workspaces.findIndex((workspace) => workspace.toString() === workspaceId.toString());
	   if (userIndex !== -1) {
		   removeduser.workspaces.splice(userIndex, 1);
		   await removeduser.save();
	   }
	  // Remove the member from the board's lists and child cards' memberships
        for(const boardId of workspace.boards){
console.log(" board of this workspace",boardId)
		const board = await boardModel.findById(boardId);
		console.log(board.title)
// Remove the member from the boards's members
		const boardMemberIndex = board.members.findIndex((boardMember) => boardMember.user.toString() === memberId.toString());
		if (boardMemberIndex !== -1) {
		  board.members.splice(boardMemberIndex, 1);
		}
	  for (const listId of board.lists) {
		console.log(" list of this board",listId)
		const list = await listModel.findById(listId);
		console.log(list.title)
		// Remove the member from the list's members
		const listMemberIndex = list.members.findIndex((listMember) => listMember.user.toString() === memberId.toString());
		if (listMemberIndex !== -1) {
		  list.members.splice(listMemberIndex, 1);
		}
		for (const cardId of list.cards) {
		  // Remove the member from the card's members
		  const card = await cardModel.findById(cardId);
		  console.log(card.title)
		  const cardMemberIndex = card.members.findIndex((cardMember) => cardMember.user.toString() === memberId.toString());
		  if (cardMemberIndex !== -1) {
			card.members.splice(cardMemberIndex, 1);
			await card.save();
		  }
		}
		await list.save();
	  }
	  await board.save();
}
	//   // Add an activity entry for the deletion
	//   board.activity.push({
	// 	user: user.id,
	// 	name: user.name,
	// 	action: `removed user '${removedMember.name}' from this workspace`,
	// 	color: user.color,
	//   });
	  // Save the board with the updated member list and memberships
	  await workspace.save();
	  return callback(null, workspace.members);
	} catch (error) {
	  console.error(error); // Log the error for debugging purposes
	  return callback({ message: 'Something went wrong', details: error.message });
	}
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
}