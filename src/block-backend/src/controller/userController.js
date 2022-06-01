const User = require('../models/user');
const fAction = require('../models/action');
const { SERVER_URL } = require('../config/conf')
const jwt = require("jwt-simple");

exports.register = async (req, res) => {
    let errors = [];
    let userCount = 0;
    if (!req.body.wallet) {
        errors.push({ text: 'Please Enter Address.' });
    }
    if (!req.body.userName) {
        errors.push({ text: 'Please Enter UserName.' });
    }
    try {
        userCount = await User.count();
    } catch (error) {
        console.log("Failed get user count");
        errors.push({ text: 'Failed to get the number of registered users' });
    }
    if (userCount > 0) {
        if (!req.body.badge) {
            errors.push({ text: 'Please Enter Badge Name.' });
        }
        if (!req.body.dao) {
            errors.push({ text: 'Please Enter DAO address.' });
        }
        if (!req.body.tokenAddress) {
            errors.push({ text: 'Badge Address is required' });
        }
    }
    if (errors.length > 0) {
        res.status(200).send({ success: false, error: errors });
    } else {
        req.body.wallet = req.body.wallet.toLowerCase();
        let user = await User.findOne({ wallet: req.body.wallet });
        if (user) {
            res.redirect(req.headers.origin + '/admin');
        } else {
            let user = null;
            if (userCount < 1) {
                // Is the most first user and super admin
                user = new User({
                    username: req.body.userName,
                    wallet: req.body.wallet,
                    badge: "",
                    dao: "",
                    isAdmin: true,
                    isRoot: true,
                    badgeAddress: ""
                });
            } else {
                user = new User({
                    username: req.body.userName,
                    wallet: req.body.wallet,
                    badge: req.body.badge,
                    dao: req.body.dao,
                    badgeAddress: req.body.tokenAddress,
                    isAdmin: false,
                    isRoot: false
                });
            }
            user.save().then((result) => {
                return res.redirect(req.headers.origin + '/admin');
            }).catch((err) => {
                res.status(200).send({ success: false, error: err });
            });
        }
    }
}

exports.login = async (req, res) => {
    User.findOne({ wallet: req.body.wallet }, (err, user) => {
        if (err) {
            res.send("Error Happened In auth /token Route");
        } else {
            if (user) {
                if (user.status == true) {
                    res.json({
                        success: true,
                        username: user.username,
                        isAdmin: user.isAdmin,
                        parent: user.parent,
                        badgeTokenAddress: user.badgeAddress,
                        url: '/onerepboard'
                    });
                } else {
                    res.json({
                        success: false,
                        data: "Your account is not activated now",
                        url: '/'
                    });
                }
            } else {
                res.json({
                    success: true,
                    username: "",
                    isAdmin: false,
                    url: '/register'
                });
            }
        }
    });
}

exports.logout = async (req, res) => {
    req.logout();
    res.status(200).send({ success: true });
}

//New end point added to get the current logged in user
exports.getLoggedInUser = async (req, res) => {
    User.findOne({ username: req.body.user }).then((user) => {
        res.status(200).send(user)
    })
}

exports.getLoggedInUserByWallet = async (req, res) => {
    User.findOne({ wallet: req.body.wallet }).then((user) => {
        res.status(200).send(user)
    })
}

exports.getUserList = async (req, res) => {
    try {
        let user = await User.findOne({ wallet: req.body.master, status: true });
        if (user === undefined || user === null) {
            return res.status(200).send([]);
        }
        if (user.isAdmin !== undefined && user.isAdmin) {
            User.aggregate([
                {
                    $lookup: {
                        from: 'actions',
                        localField: 'wallet',
                        foreignField: 'wallet',
                        as: 'actions'
                    }
                }
            ])
            .then((users) => {
                res.status(200).send({ error: 0, data: users });
            })
            .catch(error => {
                return resizeTo.status(200).send({ error: -10, data: "Error occurred in getting the files: " + error.message });
            });
        } else {
            let matchClause = { parent: req.body.master, status: true };
            if (req.body.excludeInactive === undefined || !req.body.excludeInactive) {
                matchClause = { parent: req.body.master };
            }
            User.aggregate([
                {
                    $match: matchClause
                },
                {
                    $lookup: {
                        from: 'actions',
                        localField: 'wallet',
                        foreignField: 'wallet',
                        as: 'actions'
                    }
                }
            ])
            .then((users) => {
                res.status(200).send({ error: 0, data: users });
            })
            .catch(error => {
                return resizeTo.status(200).send({ error: -10, data: "Error occurred in getting the files: " + error.message });
            });
        }
    } catch (error) {
        res.status(200).send({ error: -1, data: error.message });
    }
}

exports.getUserCount = async (req, res) => {
    try {
        let userCount = await User.count({ status: true });
        res.status(200).send({ error: 0, data: userCount });
    } catch (error) {
        res.status(200).send({ error: -1, data: "Failed to get number of users" });
    }
}

exports.getOneRepBoard = async (req, res) => {
    let parentAddress = req.body.master;
    let user = await User.findOne({ wallet: parentAddress });
    if (user.isAdmin) {
        let daoFilter = { dao: req.body.dao };
        if (!req.body.dao) {
            daoFilter = {};
        }
        let daos = await User.find(daoFilter);
        let result = [];
        for (let i = 0; i < daos.length; i++) {
            try {
                let actions = await fAction.aggregate([
                    {
                        $match: { parent: daos[i].wallet }
                    },
                    {
                        $sort: req.body.sort
                    },
                    {
                        $group: {
                            _id: "$wallet",
                            name: { $first: '$name' },
                            sum: { $sum: "$received" }
                        }
                    },
                ]);
                if (actions.length === undefined) {
                    return res.status(200).send({ error: -1, data: "Failed to get board data" });
                }
                if (actions.length < 1) {
                    continue;
                }
                for (let j = 0; j < actions.length; j++) {
                    actions[j]['dao'] = daos[i].dao;
                }
                result.push(...actions);
            } catch (error) {
                return res.status(200).send({ error: -10, data: error.message });
            }
        }
        return res.status(200).send({ error: 0, data: result });
    } else {
        await fAction.aggregate([
            {
                $match: { parent: user.parent?user.parent: user.wallet }
            },
            {
                $group: {
                    _id: "$wallet",
                    name: { $first: '$name' },
                    sum: { $sum: "$received" }
                }
            },
            {
                $sort: req.body.sort
            }
        ]).then(actions => {
            if (actions.length === undefined) {
                res.status(200).send({ error: -1, data: "Failed to get board data" });
            }
            for (let j = 0; j < actions.length; j++) {
                actions[j]['dao'] = user.dao;
            }
            res.status(200).send({ error: 0, data: actions });
        }).catch(error => {
            res.status(200).send({ error: -10, data: error.message })
        });
    }
}
/*******************************Get DAO data********************** */
exports.getDaoData = async (req, res) => {
    try {
        let user = await User.findOne({ wallet: req.body.master });
        if (user.isAdmin) {
            let daos = [];
            try {
                if (req.body.dao) {
                    daos = await User.find({ dao: req.body.dao })
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
                                dao: { $first: "$dao" }
                            }
                        },
                        {
                            $sort: { dao: 1 }
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
                    daos = await User.find({ wallet: req.body.master, dao: req.body.dao });
                } else {
                    daos = await User.find({ wallet: req.body.master });
                }
                return res.status(200).send({ error: 0, data: daos });
            } catch (error) {
                return res.status(200).send({ error: -1, data: error });
            }
        }
    } catch (error) {
        console.error("UserController.getDaoData():", error);
        return res.status(200).send({ error: -1, data: null });
    }
}

exports.getAllDaoData = async (req, res) => {
    try {
        let user = await User.findOne({ wallet: req.body.master });
        if (user.isAdmin) {
            let daos = await User.find({});
            return res.status(200).send({ error: 0, data: daos });
        }
        return res.status(200).send({ error: -2, data: "Only super admin can access this function" });
    } catch (error) {
        console.error("UserController.getDaoData():", error);
        return res.status(200).send({ error: -1, data: null });
    }
}

exports.getSelOpList = (req, res) => {
    const result = {};
    fAction.aggregate([{ $match: { parent: req.body.master } }, { $group: { _id: "$name" } }]).then((users) => {
        res.status(200).send(result);
    });
}

exports.update = async (req, res) => {
    req.body.wallet = req.body.wallet.toLowerCase();
    User.findOne({ wallet: req.body.wallet }).then(async user => {
        var puser = user;
        if (req.body._id == '') {
            if (user) {
                return res.status(200).send({ error: "ETH address duplicated!", success: false });
            } else {
                let isAdmin = false;
                try {
                    let user = await User.findOne({ wallet: req.body.master });
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
        } else {
            if (!puser) {
                return res.status(200).send({ error: "This accout does not exist!", success: false });
            } else {
                let isAdmin = false;
                try {
                    let user = await User.findOne({ wallet: req.body.master });
                    isAdmin = user.isAdmin;
                } catch (error) {
                    console.log(error);
                }
                puser.username = req.body.username;
                puser.parent = req.body.master;
                puser.wallet = req.body.wallet;
                puser.badge = req.body.badge;
                puser.dao = req.body.dao;
                // puser.isAdmin = isAdmin;
                puser.status = req.body.status;
                badgeAddress = req.body.badgeAddress
            }
        }

        puser.save().then((result) => {
            User.find({ parent: req.body.master }).then((users) => {
                res.status(200).send({ users: users, success: true });
            });
        }).catch((err) => {
            res.status(200).send({ success: false, error: "Error Occured!" });
        });
    });
}

exports.delete = async (req, res) => {
    User.findOne({ _id: req.body._id }).then(user => {
        if (user === undefined || user === null) {
            return res.status(200).send({error: -1, data: "Failed to find specified user"});
        }
        if (user.isRoot) {
            return res.status(200).send({error: 1, data: "Couldn't delete super administrator"});
        }
        User.deleteOne({ _id: req.body._id }).then((user) => {
            User.find({ parent: req.body.master }).then((users) => {
                res.status(200).send({error: 0, data: users});
            });
        });
    })
    .catch(error => {
        res.status(200).send({error: -10, data: error.message});
    });
}

