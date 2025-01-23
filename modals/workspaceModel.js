const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },

  description: { type: String },
  type: 
  { type: String },

       
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
    ref: 'user',
},


boards: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'board',
    },
],
 // Reference to the user who created the workspace
  // You can add more fields specific to your workspace requirements
});
const Workspace = mongoose.model("Workspace", workspaceSchema);

module.exports = Workspace;