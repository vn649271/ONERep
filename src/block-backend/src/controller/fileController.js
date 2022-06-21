// 
const fs = require('fs');
const uploadFile = require("../middleware/upload");
const fUserDao = require('../models/userDao');
const fUpload = require('../models/upload');
const fAction = require('../models/action');
const fUser = require('../models/user');
const fDao = require('../models/dao');
const ipfsAPI = require('ipfs-api');
const controllerCommon = require("./common");

exports.upload = async (req, res) => {
  try {
    await uploadFile(req, res);
    if (req.file == undefined) {
      return res.status(200).send({ success: false, error: "Please upload a file!" });
    }
    res.status(200).send({
      success: true,
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    res.status(200).send({
      success: false,
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

exports.addFile = async (req, res) => {
  try {
    let userDaos = await controllerCommon.getMyDAOs(req.body.master);
    // let userDaos = await fUserDao.find({ userAddress: req.body.master, isCreator: true });
    if (userDaos && userDaos.length) {
      let badgeAddress = userDaos[0].badgeAddress; // ?????????????????????
      fUpload.findOne({ ipfsuri: req.body.ipfsuri }).then(data => {
        if (data) {
          return res.status(200).send({ success: false, error: "Couldn't find uploaded file" });
        } else {
          /****************creating file object***************************/
          const addfile = new fUpload({
            filename: req.body.filename,
            ipfsuri: req.body.ipfsuri,
            status: req.body.status,
            reputation: req.body.reputation,
            importer: req.body.master,
            badge: badgeAddress,
            created_at: Date.now()
          });
          // Save ONERep File info List
          addfile.save().then(async retForNewFile => {
            req.body.data.map((row, i) => {
              // Save each action 
              const addAction = new fAction({
                name: row[1],
                wallet: row[2].toLowerCase(),
                received: parseInt(row[3]),
                badgeAddress: badgeAddress,
                sent: parseInt(row[4]),
                epoch_number: row[5],
                date: row[6],
                recipientContractAddress: row[7],
                created_at: Date.now()
              });
              addAction.save().then(async retForNewAction => {
                // Save each DAO user if not exist
                let userInfo = await fUser.findOne({ wallet: row[2].toLowerCase() });
                if (!userInfo) {
                  const addUser = new fUser({
                    username: row[1],
                    wallet: row[2].toLowerCase(),
                    parent: req.body.master,
                    userType: 3, // DAO member
                    created_at: Date.now()
                  });
                  userInfo = await addUser.save();
                }
                if (userInfo && userInfo.id) {
                  // Save User-DAO relation
                  const addUserDaoRelation = new fUserDao({
                    userAddress: row[2].toLowerCase(),
                    badgeAddress: badgeAddress,
                    received: parseInt(row[3]),
                    isCreator: false,
                    created_at: Date.now()
                  });
                  let ret = await addUserDaoRelation.save();
                  console.log("Successfully addUserDaoRelation.save(): ", ret);
                }
              }).catch(error => {
                return res.status(200).send({ success: false, error: error.message })
              })
            });
            /*************** Update 'sent' field in User *************/
            let user = await fUser.findOne({ wallet: req.body.master });
            if (!user) {
              console.log("Not found the user with the specified wallet", req.body.master);
              return;
            }
            user.set('sent', parseInt(user.sent) + parseInt(req.body.reputation));
            let retForUpdatedSentAmount = await user.save();
            return res.status(200).send({ success: true });
          }).catch(error => {
            return res.staus(200).send({ success: false, error: error.message })
          });
        }
      });
    } else {
      return res.status(200).send({ success: false, data: "Failed to get USER-DAO relation" })
    }
  } catch (err) {
    res.status(500).send({
      message: `Could not add the file`,
    });
  }
};

exports.ipfsupload = async (req, res) => {
  console.log("fileController.ipfsupload(): req.body.filepath=", req.body.filepath);
  let testFile = fs.readFileSync(req.body.filepath);
  //Creating buffer for ipfs function to add file to the system
  let testBuffer = new Buffer(testFile);
  const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' });
  ipfs.files.add(testBuffer, function (err, file) {
    if (err) {
      console.log(err);
    }
    console.log(file)
  })
}

exports.getOneRepFiles = async (req, res) => {
  try {
    let badgeAddress = req.body.badgeAddress;
    if (badgeAddress !== null && badgeAddress !== "") {
      // Get files for specified DAO
      try {
        let files = await fUpload.find({ badge: badgeAddress }).lean();
        if (files.length !== undefined && files.length > 0) {
          let dao = await fDao.findOne({ badgeAddress: badgeAddress });
          for (let i = 0; i < files.length; i++) {
            files[i]['dao'] = dao.name;
            files[i]['badgeAddress'] = dao.badgeAddress;
          }
        }
        return res.status(200).send({ error: 0, data: files });
    } catch (error) {
        return resizeTo.status(200).send({ error: -11, data: "Error occurred in getting the list of users with the specified DAO: " + error.message });
      }
    } else {
      // Get files for all DAO to which user belongs
      fUser.findOne({ wallet: req.body.master }).then(async user => {
        if (user.userType === 0) {
          fUpload.aggregate([
            {
              $lookup: {
                from: 'users',
                localField: 'importer',
                foreignField: 'wallet',
                as: 'userInfo'
              }
            },
            {
              $lookup: {
                from: 'userdaos',
                let: { badgeAddress: '$badge' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$$badgeAddress', '$badgeAddress']
                      }
                    }
                  },
                ],
                as: 'daoRels'
              }
            }
          ]).then(async files => {
            for (let i = 0; i < files.length; i++) {
              // Find badge address
              let badgeAddress = null;
              if (files[i].daoRels && files[i].daoRels.length) {
                for (let j = 0; j < files[i].daoRels.length; j++) {
                  if (files[i].daoRels[j].isCreator) {
                    badgeAddress = files[i].daoRels[j].badgeAddress;
                    break;
                  }
                }
              }
              let daoInfo = null;
              if (badgeAddress) {
                daoInfo = await fDao.findOne({ badgeAddress: badgeAddress }).lean();
              }
              if (daoInfo) {
                files[i]['badgeAddress'] = daoInfo.badgeAddress;
                files[i]['badge'] = daoInfo.badge;
                files[i]['dao'] = daoInfo.name;
              }
            }
            res.status(200).send({ error: 0, data: files });
          }).catch(error => {
            return resizeTo.status(200).send({ error: -10, data: "Error occurred in getting the files: " + error.message });
          });
        } else {
          let myDaoList = await controllerCommon.getMyDAOs(req.body.master);
          if (myDaoList && myDaoList.length) {
            let fileInfoList = [];
            for (let i in myDaoList) {
              await fUpload.aggregate([
                {
                  $match: { badge: myDaoList[i].badgeAddress }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'importer',
                    foreignField: 'wallet',
                    as: 'userInfo'
                  }
                }
              ]).then(async files => {
                if (files && files.length) {
                  for (let j in files) {
                    files[j]['dao'] = myDaoList[i].dao;
                  }
                  fileInfoList.push(...files);
                }
              }).catch(error => {
                return resizeTo.status(200).send({ error: -10, data: "Error occurred in getting the files: " + error.message });
              });
            }
            res.status(200).send({ error: 0, data: fileInfoList });
          }
        }
      });
    }
  } catch (e) {
    res.status(200).send({ error: -12, data: "Error occurred in getting file list: " + e.message });
  }
};

exports.download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/public/uploads/";
  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

exports.getOneRepFile = (req, res) => {
  const directoryPath = __basedir + "/public/uploads/";
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }
    let fileInfos = [];
    files.forEach((file) => {
      if (file.split('__')[0] == req.query.userId) {
        fileInfos.push({
          name: file,
          url: directoryPath + file,
        });
      }
    });
    res.status(200).send(fileInfos);
  });
};