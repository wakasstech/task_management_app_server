const mongoose= require('mongoose');
const dotenv=require('dotenv')
const cors = require('cors');
const express = require('express');
const unless = require('express-unless');
dotenv.config({path:'./config.env'});
const auth = require('./Middlewares/auth.js');
const app = express()
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
   // useCreateIndex: true,
   // useFindAndModify:true,
  }).then(console.log("Connection Sucessfully"))
  .catch((err) => console.log(err));
  const userRoute = require("./routes/userRoute");
  const boardRoute = require("./routes/boardRoute");
  const listRoute = require("./routes/listRoute");
  const cardRoute = require("./routes/cardRoute");
  const workspaceRoute = require("./routes/workspaceRoute");
 app.use(express.json())
 app.use(cors());
// AUTH VERIFICATION AND UNLESS
auth.verifyToken.unless = unless;
app.use(
	auth.verifyToken.unless({
		path: [
			{ url: '/user/login', method: ['POST'] },
			{ url: '/user/register', method: ['POST'] },
      { url: '/user/submit-otp', method: ['POST'] },
			{ url: '/user/send-otp', method: ['POST'] },
      { url: '/user/registerViaInvite', method: ['POST'] },
		],
	})
);
// const protectedRoutes = [
//  // '/user/get-all-users',
//   // workspace protected routes here
//   '/workspace/create',
//   '/workspace/update-workspaceDescription/:workspaceId',
//   '/workspace/update-workspaceName/:workspaceId',
//   '/workspace/new-addmember',
//   '/workspace/workspaceId/delete-member',
//   // board protected routes here
//   '/board/:workspaceId/:boardId/add-member',
//   '/board/:workspaceId/:boardId/delete-member-from-Board',
//   '/board/:workspaceId/:boardId/update-background',
//   '/board/:workspaceId/:boardId/update-board-description',
//   '/board/:workspaceId/:boardId/update-board-title',
//   '/board/create',
  
//   // list protected routes here
//   '/list/:workspaceId/:boardId/:listId/update-title',
//   '/list/:workspaceId/create',
//    '/list/:workspaceId/:boardId/:listId',
//   '/list/change-card-order',
//   '/list/change-list-order',
//   '/list/:workspaceId/:boardId/:listId/add-member',
//   '/list/:workspaceId/:boardId/:listId/delete-member-from-list',
//   // card protected routes here 
//   '/card/workspaceId/:boardId/:listId/:cardId/delete-card',
//   '/card/:workspaceId/:boardId/:listId/:cardId/update-dates',
//   '/card/:workspaceId/:boardId/:listId/:cardId/update-cover',
//   '/card/:workspaceId/:boardId/:listId/:cardId/:checklistId/:checklistItemId/delete-checklist-item',
//   '/card/:workspaceId/:boardId/:listId/:cardId/:checklistId/:checklistItemId/set-checklist-item-text',
//   '/card/:workspaceId/:boardId/:listId/:cardId/:checklistId/add-checklist-item',
//   '/card/:workspaceId/:boardId/:listId/:cardId/:checklistId/delete-checklist',
//   '/card/:workspaceId/:boardId/:listId/:cardId/create-checklist',
//   '/card/:workspaceId/:boardId/:listId/:cardId/:labelId/update-label-selection',
//   '/card/:workspaceId/:boardId/:listId/:cardId/:labelId/delete-label',
//   '/card/:workspaceId/:boardId/:listId/:cardId/:labelId/update-label',
//   '/card/:workspaceId/:boardId/:listId/:cardId/create-label',
//   '/card/:workspaceId/:boardId/:listId/:cardId/add-member',
//   '/card/:workspaceId/:boardId/:listId/:cardId/:memberId/delete-member',
//   '/card/create',
//   '/card/:workspaceId/:boardId/:listId/:cardId',
// ];
//app.use(protectedRoutes,auth.adminAccessMiddleware);
// AUTH ADMIN VERIFICATION AND UNLESS
// auth.adminAccessMiddleware.unless = unless;

// app.use(
// 	auth.adminAccessMiddleware.unless({
// 		path: [
//       //user unless routes
//       { url: '/user/login', method: ['POST'] },
// 			{ url: '/user/register', method: ['POST'] },
//       { url: '/user/submit-otp', method: ['POST'] },
// 			{ url: '/user/send-otp', method: ['POST'] },
// 			{ url: '/user/get-user', method: ['GET'] },
// 			{ url: '/user/get-user-with-email', method: ['GET'] },
//     //workspace unless routes
//       { url: '/workspace/get-workspaces', method: ['GET'] },
//       { url: '/workspace/get-workspaces', method: ['GET'] }, 
//       { url: /^\/workspace\/get-workspace\/\w+$/, method: ['GET'] },
//   //board unless routes
//   { url: /^\/board\/\w+$/, method: ['GET'] },
//   { url: /^\/board\/\w+\/\w+$/, method: ['GET'] },
//   //list unless routes

// 		],
// 	})
// );
 //   app.use("/api/auth", authRoute);
  //  app.use("/api/users", userRoute);
    app.use('/user', userRoute);
app.use('/board', boardRoute);
app.use('/list', listRoute);
app.use('/card', cardRoute);
app.use('/workspace', workspaceRoute);
 app.get('/about', function (req, res) {
       res.send('Hello World  of About')
        })
  app.listen(5000,()=>{
    console.log(" Server is running on port 5000");
});
