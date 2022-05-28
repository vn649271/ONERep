const User  = require('../models/user');
const fAction  = require('../models/action');
const {SERVER_URL} = require('../config/conf')
const jwt = require("jwt-simple");

exports.register = async (req, res) => {
    let errors = [];
    if (!req.body.username) {
        errors.push({ text: 'Please Enter UserName.' });
    }
    if (!req.body.wallet) {
        errors.push({ text: 'Please Enter Address.' });
    }
    if (!req.body.badge) {
        errors.push({ text: 'Please Enter Badge Name.' });
    }
    if (!req.body.dao) {
        errors.push({ text: 'Please Enter DAO address.' });
    }
    if (!req.body.tokenaddress)
    {
        errors.push({text: 'Badge Address is required'});
    }
    if (errors.length > 0) {
        res.status(200).send({success: false, error: errors});
    } else {
        req.body.wallet = req.body.wallet.toLowerCase();
        let user = await User.findOne({ wallet: req.body.wallet });
        if (user) {
            res.redirect(req.headers.origin + '/admin');
        } else {
            let ret = await User.aggregate({ $count: "id"});
            let user = new User({
                username: req.body.username,
                wallet: req.body.wallet,
                badge: req.body.badge,
                dao: req.body.dao,
                badgeAddress: req.body.tokenaddress
            });
            if (ret.length === undefined || ret.length < 1 || ret[0].id < 1) {
                // Is the most first user and super admin
                user = new User({
                    username: req.body.username,
                    wallet: req.body.wallet,
                    badge: req.body.badge,
                    dao: req.body.dao,
                    isAdmin: true,
                    badgeAddress: req.body.tokenaddress
                }); 
            }
            user.save().then((result) => {
                res.redirect(req.headers.origin + '/admin');
            }).catch((err) => {
                res.status(200).send({success: false, error: err});
            });
        }
    }
}

exports.login = async(req, res) => {
    User.findOne({ wallet: req.body.wallet }, (err, user) => {
        if (err) {
            res.send("Error Happened In auth /token Route");
        } else {
            if (user) {
                console.log("User in login",user)
                if(user.status == true) {
                    res.json({
                        success: true,
                        username: user.username,
                        isAdmin: user.isAdmin,
                        parent: user.parent,
                        badgeTokenAddress: user.badgeAddress,
                        url: '/onerepboard'
                    });
                } else {
                    console.log("User in login 1",user)
                    res.json({
                        success: true,
                        username: "",
                        isAdmin: false,
                        parent:"",
                        badgeTokenAddress: null,
                        url: '/walletconnect'
                    });
                }
            } else {
                res.json({
                    success: true,
                    username: "",
                    isAdmin: false,
                    url: '/walletconnect'
                });
            }
        }
    }); 
}

exports.logout = async(req,res)=>{
    req.logout();
    res.status(200).send({success: true});
}

//New end point added to get the current logged in user
exports.getLoggedInUser = async(req,res) => {
    console.log("The user in the request is",req.body.user)
    User.findOne({username: req.body.user}).then((user)=>{
        console.log("The user is", user)
        res.status(200).send(user)
    })
}

exports.getLoggedInUserByWallet = async(req,res) => {
    console.log("The user in the request is",req.body.wallet)
    User.findOne({wallet: req.body.wallet}).then((user)=>{
        console.log("The user is", user)
        res.status(200).send(user)
    })
}

exports.getUserList = async(req, res) => {
    User.find({parent: req.body.master}).then((users) => {
        res.status(200).send(users);
    });
}

exports.getOneRepBoard  = async(req, res) => {
    let parentAddress = req.body.master;
    let user = await User.findOne({wallet: parentAddress});
    if (user.isAdmin) {
        let daos = await User.find({dao: req.body.dao});
        let result = [];
        for (let i = 0; i < daos.length; i++) {
            try {
                let actions = await fAction.aggregate([
                    {
                        $match: {parent: daos[i].wallet}
                    },
                    {
                        $group:{
                            _id: "$wallet", 
                            name : { $first: '$name' }, 
                            sum: {$sum: "$received"}
                        }
                    }, 
                    {
                        $sort: req.body.sort
                    }
                ]);
                if (actions.length === undefined) {
                    return res.status(200).send({error: -1, data: "Failed to get board data"});
                }
                if (actions.length < 1) {
                    continue;
                }
                result.push(...actions);
            } catch(error) {
                return res.status(200).send({error: -10, data: error.message});
            }
        }
        return res.status(200).send({error: 0, data: result});
    } else {
        await fAction.aggregate([
            {
                $match : { parent : parentAddress }
            },
            {
                $group:{
                    _id: "$wallet", 
                    name : { $first: '$name' }, 
                    sum: {$sum: "$received"}
                }
            }, 
            {
                $sort: req.body.sort
            }
        ]).then(actions => {
            if (actions.length === undefined) {
                res.status(200).send({error: -1, data: "Failed to get board data"});
            }
            res.status(200).send({error: 0, data: actions});
        }).catch(error => {
            res.status(200).send({error: -10, data: error.message})
        });
    }
}
/*******************************Get DAO data********************** */
exports.getDaoData = async(req, res)=> {
    try {
        let user = await User.findOne({wallet: req.body.master});
        if (user.isAdmin) {
            let daos = [];
            try {
                if (req.body.dao) {
                    daos = await User.find({dao: req.body.dao})
                    .then(daos => {
                        return res.status(200).send({ error: 0, data: daos });
                    })
                    .catch(error => {
                        return res.status(200).send({ error: -1, data: error.message });
                    });
                } else {
                    await User.aggregate(
                        {
                            $group: {
                                _id: "$dao", 
                                dao: {$first: "$dao"}
                            }
                        }, 
                        {
                            $sort: {dao: 1}
                        }            
                    )
                    .then(daos => {
                        return res.status(200).send({ error: 0, data: daos });
                    })
                    .catch(error => {
                        return res.status(200).send({ error: -1, data: error.message });
                    });
                }
            } catch (error) {
                return res.status(200).send({ error: -1, data: error.message });
            }
        } else {
            let daos = [];
            try {
                if (req.body.dao) {
                    daos = await User.find({wallet: req.body.master, dao: req.body.dao});
                } else {
                    daos =  await User.find({wallet: req.body.master});
                }
                return res.status(200).send({ error: 0, data: daos });
            } catch (error) {
                return res.status(200).send({ error: -1, data: error });
            }
        }
    } catch (error) {
        console.error("UserController.getDaoData():", error);
        return res.status(200).send({error: -1, data: null});
    }
}

exports.getAllDaoData = async(req, res)=> {
    try {
        let user = await User.findOne({wallet: req.body.master});
        if (user.isAdmin) {
            let daos = await User.find({});
            return res.status(200).send({ error: 0, data: daos });
        }
        return res.status(200).send({ error: -2, data: "Only super admin can access this function" });
    } catch (error) {
        console.error("UserController.getDaoData():", error);
        return res.status(200).send({error: -1, data: null});
    }
}

exports.getSelOpList = (req, res) => {
    const result = {};
    fAction.aggregate([{ $match : { parent : req.body.master }}, {$group:{_id:"$name"}}]).then((users) => {
        res.status(200).send(result);
    });
}

exports.update = async (req, res) => {
    req.body.wallet = req.body.wallet.toLowerCase();
    User.findOne({wallet: req.body.wallet}).then(async user => {
        var puser = user;
        if (req.body._id == '')
        {
            console.log("Inside if req.body._id")
            if (user)
            {
                console.log("inside if ETH address");
                return res.status(200).send({error: "ETH address duplicated!", success: false});
            }
            else
            {
                let isAdmin = false;
                try {
                    let user = await User.findOne({wallet: req.body.master});
                    isAdmin = user.isAdmin;
                } catch (error) {
                    console.log(error);
                }
                puser = new User({
                    username: req.body.username,
                    parent: req.body.master,
                    wallet: req.body.wallet,
                    badge: req.body.badge,
                    dao: req.body.dao,
                    isAdmin: isAdmin,
                    status: req.body.status,
                    badgeAddress: req.body.badgeAddress
                });
            }
        }
        else
        {
            if (!puser)
            {
                console.log("if !puser");
                return res.status(200).send({error: "This accout does not exist!", success: false});
            }
            else
            {
                let isAdmin = false;
                try {
                    let user = await User.findOne({wallet: req.body.master});
                    isAdmin = user.isAdmin;
                } catch (error) {
                    console.log(error);
                }
                puser.username = req.body.username;
                puser.parent = req.body.master;
                puser.wallet = req.body.wallet;
                puser.badge = req.body.badge;
                puser.dao = req.body.dao;
                puser.isAdmin = isAdmin;
                puser.status = req.body.status;
                badgeAddress = req.body.badgeAddress
            }
        }

        puser.save().then((result) => {
            User.find({parent: req.body.master}).then((users) => {
                res.status(200).send({users: users, success: true});
            });
        }).catch((err) => {
            res.status(200).send({success: false, error: "Error Occured!"});
        });
    });
}

exports.delete = async (req, res) => {
    User.deleteOne({ _id: req.body._id }).then((user) => {
        User.find({parent: req.body.master}).then((users) => {
            res.status(200).send(users);
        });
    });
}

