const express = require('express');
const workspaceController = require('../Controllers/workspaceController');
const router = express.Router();
const auth = require("../Middlewares/auth");
router.post('/create', workspaceController.create);
router.get("/get-workspaces",workspaceController.getWorkspaces);
router.get("/get-workspace/:workspaceId",  workspaceController.getWorkspace);
router.post('/:workspaceId/add-member', workspaceController.addMember);
router.post('/new-addmember', workspaceController.newAddMember);
router.delete('/:workspaceId/delete-member', workspaceController.deleteMember);
router.put("/update-workspaceDescription/:workspaceId", workspaceController.updateWorkspaceDescription);
router.put("/update-workspaceName/:workspaceId",  workspaceController.updateWorkspaceName);
module.exports = router;
  