const express = require('express');
const router = express.Router();

const listController = require('../Controllers/listController');
router.put('/:workspaceId/:boardId/:listId/update-title',  listController.updateListTitle);
router.post('/:workspaceId/create',  listController.create);
router.get('/:workspaceId/:boardId',   listController.getAll);
router.get('/getAll-selected-board-lists',  listController.getAllListofSelectedBoard);
router.delete('/:workspaceId/:boardId/:listId',listController.deleteById);
router.post('/change-card-order',    listController.updateCardOrder);
router.post('/change-list-order',    listController.updateListOrder);
router.post('/:workspaceId/:boardId/:listId/add-member', listController.addMemberToList);
router.delete('/:workspaceId/:boardId/:listId/delete-member-from-list', listController.deleteMemberFromList);
module.exports = router;
