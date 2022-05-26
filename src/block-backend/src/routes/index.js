const express = require("express");
const router = express.Router();
var passport = require('passport');
const fileController = require("../controller/fileController");
const userController = require("../controller/userController");

let routes = (app) => {

  //file manage
  router.post("/upload", fileController.upload);
  router.post("/files/upload", fileController.ipfsupload);
  router.post("/files/add", fileController.addFile);
  router.post("/files", fileController.getListFiles);
  router.get("/files/:name", fileController.download);

  //user manage
  router.post("/users", userController.getUserList);
  router.post("/users/loggedinuser",userController.getLoggedInUser)
  router.post("/users/loggedinuserbywallet",userController.getLoggedInUserByWallet)
  router.post('/users/register', userController.register);
  router.post('/users/login', userController.login);
  router.post("/users/update", userController.update);
  router.post("/users/delete", userController.delete);
  router.post('/getOneRepBoard', userController.getOneRepBoard);
  router.post('/getDaoData', userController.getDaoData);
  router.post('/getSelOpList', userController.getSelOpList);
  router.get('/logout', userController.logout);
  
  app.use(router);
};

module.exports = routes;