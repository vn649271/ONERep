const User = require('../models/user');
const fAction = require('../models/action');
const jwt = require("jwt-simple");
const Dao = require('../models/dao');
const UserDao = require('../models/userDao');
const dao = require('../models/dao');
const controllerCommon = require("./common");
const { findOneAndDelete } = require('../models/user');
// const { ObjectId } = require('mongoose/lib/types');

exports.registerDao = async (req, res) => {
    try {
        let dao = new Dao({
            name: req.body.name,
            badge: req.body.badge,
            badgeAddress: req.body.badgeAddress,
            created_at: Date.now()
        })
        let newDao = await dao.save();
        return res.status(200).send({ success: true, data: newDao.id });
    } catch (error) {
        return res.status(200).send({ success: false, error: "Failed to create new DAO:" + error.message });
    };
}

const lookupClause = {
    $lookup: {
        from: 'userdaos',
        let: { userAddress: '$wallet' },
        pipeline: [
            {
                $match: {
                    $expr: {
                        $eq: ['$$userAddress', '$userAddress']
                    }
                }
            },
            {
                $lookup: {
                    from: 'daos',
                    localField: 'badgeAddress',
                    foreignField: 'badgeAddress',
                    as: 'dao'
                }
            }
        ],
        as: 'daoRelation'
    },
}


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
        let existingUser = await User.findOne({ wallet: req.body.wallet });
        if (existingUser) {
            res.redirect(req.headers.origin + '/admin');
        } else {
            let user = null;
            let newDao = null;
            if (userCount < 1) {
                // The most first user must be as super admin
                user = new User({
                    username: req.body.userName,
                    wallet: req.body.wallet,
                    userType: 0,    // Super Administrator
                    isRoot: true,
                    created_at: Date.now()
                });
            } else {
                // System Account User Registration
                user = new User({
                    username: req.body.userName,
                    wallet: req.body.wallet,
                    userType: 1,    // System Account User
                    isRoot: false,
                    created_at: Date.now()
                });
            }
            try {
                let ret = await user.save();
                // Save user-dao relation to userDao collection
                if (req.body.tokenAddress) {
                    let dao = await Dao.findOne({ badgeAddress: req.body.tokenAddress });
                    if (dao) {
                        let userDao = new UserDao({
                            userAddress: ret.wallet,
                            badgeAddress: dao.badgeAddress,
                            received: 0,
                            isCreator: true,
                            created_at: Date.now()
                        });
                        userDao.save().then(result => {
                            return res.redirect(req.headers.origin + '/admin');
                        }).catch(error => {
                            return res.status(200).send({ success: false, error: error.message });
                        });
                    }
                } else {
                    return res.redirect(req.headers.origin + '/admin');
                }
            } catch (err) {
                res.status(200).send({ success: false, error: err });
            }
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
                        userType: user.usertype,
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
                    type: 1,
                    url: '/register'
                });
            }
        }
    }).catch(err => {
        res.json({
            success: false,
            data: 'Failed to login: ' + err.message,
            url: '/'
        });
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
    User.aggregate([
        {
            $match: { wallet: req.body.wallet }
        },
        lookupClause
    ]).then(users => {
        if (users && users.length) {
            // let userInfo = users[0];
            // if (userInfo.userType === 0) {
            //     console.log("No need user-dao relation for admin");
            //     userInfo.daoRelation = null;
            // }
            return res.status(200).send({ error: 0, data: users[0] });
        } else {
            return res.status(200).send({ error: 1, data: null });
        }
    }).catch(error => {
        return res.status(200).send({ error: -3, data: "Failed to get logged in user" });
    })
    // await User.findOne({ wallet: req.body.wallet }).then(async user => {
    //     UserDao.findOne({ userId: user._id.toString(), isCreator: true }).then(userDaoRelation => {
    //         if (userDaoRelation) {
    //             Dao.findOne({ _id: ObjectId(userDaoRelation.daoId) }).then(dao => {
    //                 user['dao'] = dao;
    //                 return res.status(200).send({ error: 0, data: user });
    //             }).catch(error => {
    //                 return res.status(200).send({ error: -1, data: error.message });
    //             });
    //         } else {
    //             return res.status(200).send({ error: 0, data: user });
    //         }
    //     }).catch(error => {
    //         return res.status(200).send({
    //             error: -2,
    //             data: "Failed to get dao relation for the logged in user: " +
    //                 error.message
    //         });
    //     });
    // }).catch(error => {
    //     return res.status(200).send({ error: -3, data: "Failed to get logged in user" });
    // })
}

function _groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

const _getUserList = async (req, res) => {
    try {
        console.log("getUserList()");
        let user = await User.findOne({ wallet: req.body.master, status: true });
        if (user === undefined || user === null) {
            return res.status(200).send([]);
        }
        let lookupFilter = [
            {
                $lookup: {
                    from: 'users',
                    let: { userAddress: '$userAddress' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$$userAddress', '$wallet']
                                },
                            }
                        }
                    ],
                    as: 'users'
                }
            },
            {
                $lookup: {
                    from: 'daos',
                    localField: 'badgeAddress',
                    foreignField: 'badgeAddress',
                    as: 'daos'
                }
            }
        ];

        if (user.userType !== undefined && !user.userType) {    // Super Admin
            User.aggregate([
                {
                    $lookup: {
                        from: 'userdaos',
                        let: { userAddress: '$wallet' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$userAddress', '$userAddress']
                                    }
                                },
                            }
                        ],
                        as: 'daoRels'
                    }
                },
            ]).then(async users => {
                try {
                    let ret = [];
                    for (let i = 0; i < users.length; i++) {
                        if (users[i].userType > 2) {
                            delete users[i];
                            continue;
                        }
                        if (users[i].daoRels && users[i].daoRels.length) {
                            let daoRels = users[i].daoRels;
                            const groupedByBadgeAddress = _groupBy(daoRels, daoRel => daoRel.badgeAddress);
                            let groupedDaoRels = [];
                            groupedByBadgeAddress.forEach(daoRelInfo => {
                                let totalReceived = 0;
                                for (let k = 0; k < daoRelInfo.length; k++) {
                                    totalReceived += daoRelInfo[k].received;
                                }
                                let groupedDaoRelInfo = daoRelInfo[0];
                                groupedDaoRelInfo['received'] = totalReceived;
                                groupedDaoRels.push(groupedDaoRelInfo);
                            });
                            let daos = [];
                            try {
                                for (let j in groupedDaoRels) {
                                    let dao = await Dao.findOne({
                                        badgeAddress: groupedDaoRels[j].badgeAddress
                                    }).lean();
                                    dao['received'] = groupedDaoRels[j].received;
                                    daos.push(dao);
                                }
                            } catch (error) {
                                console.log(error);
                            }
                            users[i]['daos'] = daos;
                        }
                        ret.push(users[i]);
                    }
                    controllerCommon.sort(ret, 'username', 1);
                    return res.status(200).send({ success: true, data: ret });
                } catch (error) {
                    return res.status(200).send({ success: false, data: "Error occurred in getting the files: " + error.message });
                }
            }).catch(error => {
                return res.status(200).send({ success: false, data: "Error occurred in getting the files: " + error.message });
            });
        } else { // System User
            // let topParent = await _getTopParentUser(req.body.master);
            let matchClause = { userAddress: req.body.master };
            if (req.body.excludeInactive !== undefined && req.body.excludeInactive) {
            }
            let ret = await UserDao.find({ userAddress: req.body.master });
            let badgeAddress = null;
            if (ret && ret.length) {
                // In case of system account user
                badgeAddress = ret[0].badgeAddress; // ???????????????????????????
                UserDao.aggregate([
                    {
                        $match: { badgeAddress: badgeAddress }
                    },
                    {
                        $group: {
                            _id: "$userAddress",
                            userAddress: { $first: "$userAddress" },
                            badgeAddress: { $first: "$badgeAddress" },
                            received: { '$sum': '$received' }
                        }
                    },
                    ...lookupFilter,
                ]).then(async userDaos => {
                    let users = [];
                    try {
                        for (let i = 0; i < userDaos.length; i++) {
                            if (userDaos[i].users.length) {
                                let user = userDaos[i].users[0];
                                if (user.userType > 2) {
                                    continue;
                                }
                                user['daos'] = userDaos[i].daos;
                                if (user.daos && user.daos.length) {
                                    user.daos[0]['received'] = userDaos[i].received;
                                }
                                users.push(user);
                            } else {
                                return res.status(200).send({
                                    success: false,
                                    data: "DB error in getting the USER from USER-DAO relation"
                                });
                            }
                        }
                        controllerCommon.sort(users, 'username', 1);
                        res.status(200).send({ success: true, data: users });
                    } catch (error) {
                        return res.status(200).send({ success: false, data: "Error occurred in getting the files: " + error.message });
                    }
                }).catch(error => {
                    return res.status(200).send({ success: false, data: "Error occurred in getting the files: " + error.message });
                });
            } else {
                return res.status(200).send({
                    success: false,
                    message: "Somethings wrong in getting USER-DAO relation"
                });
            }
        }
    } catch (error) {
        res.status(200).send({ success: false, data: error.message });
    }
}

exports.getUserList = async (req, res) => {
    _getUserList(req, res);
}

exports.getUserCount = async (req, res) => {
    console.log("getUserCount()");
    try {
        let userCount = await User.count({ status: true });
        res.status(200).send({ error: 0, data: userCount });
    } catch (error) {
        res.status(200).send({ error: -1, data: "Failed to get number of users" });
    }
}

exports.getOneRepBoard = async (req, res) => {
    let sortOption = req.body.sort ? req.body.sort : {};
    let user = await User.findOne({ wallet: req.body.master });
    const filters = [
        {
            '$group': {
                _id: '$wallet',
                name: { '$first': '$name' },
                badgeAddress: { '$first': '$badgeAddress' },
                sum: { '$sum': '$received' }
            }
        },
        {
            '$lookup': {
                from: 'daos',
                localField: 'badgeAddress',
                foreignField: 'badgeAddress',
                as: 'dao'
            }
        }
    ];
    if (user && user.userType === 0) {
        // Super admin
        if (!req.body.badgeAddress) {
            // All data
            try {
                let availableDaoList = await fAction.aggregate({
                    '$group': {
                        _id: '$badgeAddress',
                    }
                });
                if (availableDaoList === undefined ||
                    availableDaoList === null ||
                    availableDaoList.length === undefined ||
                    availableDaoList.length < 1) {
                    return res.status(200).send({ success: true, data: [] });
                }
                let result = [];
                for (let i = 0; i < availableDaoList.length; i++) {
                    let actions = await fAction.aggregate(
                        {
                            $match: { 'badgeAddress': availableDaoList[i]._id }
                        },
                        ...filters
                    );
                    if (actions.length === undefined) {
                        return res.status(200).send({ success: false, data: "Failed to get board data" });
                    }
                    for (let j = 0; j < actions.length; j++) {
                        actions[j]['badge'] = actions[j].dao[0].badge;
                        actions[j]['dao'] = actions[j].dao[0].name;
                    }
                    result.push(...actions);
                }
                // Sort
                for (let k in sortOption) {
                    controllerCommon.sort(result, k, sortOption[k]);
                }
                return res.status(200).send({ success: true, data: result });
            } catch (error) {
                return res.status(200).send({ success: false, data: error.message });
            }
        } else {
            try {
                let _filters = [];
                // _filters = [];
                _filters.push({
                    $match: { 'badgeAddress': req.body.badgeAddress }
                }, ...filters);
                let actions = await fAction.aggregate(_filters);
                if (actions.length === undefined) {
                    return res.status(200).send({ success: false, data: "Failed to get board data" });
                }
                for (let j = 0; j < actions.length; j++) {
                    actions[j]['badge'] = actions[j].dao[0].badge;
                    actions[j]['dao'] = actions[j].dao[0].name;
                }
                // Sort
                for (let k in sortOption) {
                    controllerCommon.sort(actions, k, sortOption[k]);
                }
                return res.status(200).send({ success: true, data: actions });
            } catch (error) {
                return res.status(200).send({ success: false, data: error.message });
            }
        }
    } else {    // System Account User
        if (!req.body.badgeAddress) {
            // Get board data for all the DAOs the user belongs to
            let leadDaoRels = await controllerCommon.getMyDAOs(req.body.master);
            if (leadDaoRels === null) {
                leadDaoRels = [];
            }
            let resultArray = [];
            try {
                for (let i = 0; i < leadDaoRels.length; i++) {
                    let actions = await fAction.aggregate([
                        {
                            $match: { badgeAddress: leadDaoRels[i].badgeAddress }
                        },
                        ...filters,
                        {
                            $sort: req.body.sort
                        }
                    ]);
                    if (actions.length === undefined) {
                        res.status(200).send({ success: false, data: "Failed to get board data" });
                    }
                    for (let j = 0; j < actions.length; j++) {
                        if (actions[j].dao.length) {
                            actions[j]['badge'] = actions[j].dao[0].badge;
                            actions[j]['dao'] = actions[j].dao[0].name;
                        }
                    }
                    resultArray.push(...actions);
                }
                // Sort
                for (let k in sortOption) {
                    controllerCommon.sort(resultArray, k, sortOption[k]);
                }
                res.status(200).send({ success: true, data: resultArray });
            } catch (error) {
                res.status(200).send({ success: false, data: error.message })
            };
        } else {
            // Get actions for specified DAO
            try {
                let actions = await fAction.aggregate([
                    {
                        $match: { badgeAddress: req.body.badgeAddress }
                    },
                    ...filters,
                    {
                        $sort: req.body.sort
                    }
                ]);
                if (actions.length === undefined) {
                    res.status(200).send({ success: false, data: "Failed to get board data" });
                }
                for (let j = 0; j < actions.length; j++) {
                    if (actions[j].dao.length) {
                        actions[j]['badge'] = actions[j].dao[0].badge;
                        actions[j]['dao'] = actions[j].dao[0].name;
                    }
                }
                // Sort
                for (let k in sortOption) {
                    controllerCommon.sort(actions, k, sortOption[k]);
                }
                res.status(200).send({ success: true, data: actions });
            } catch (error) {
                res.status(200).send({ success: false, data: error.message })
            };
        }
    }
}
const _getTopParentUser = async wallet => {
    let _parentAddress = wallet;
    let topParent = null;
    while (_parentAddress) {
        try {
            topParent = await User.findOne({ wallet: _parentAddress });
            _parentAddress = topParent.parent ? topParent.parent : null;
        } catch (error) {
            return null;
        }
    }
    return topParent;
}
/*******************************Get DAO data********************** */
exports.getDaoData = async (req, res) => {
    try {
        let user = await User.findOne({ wallet: req.body.master });
        if (user.userType === 0) { // in case of super administrator
            // Super Admin
            let daos = [];
            try {
                if (req.body.dao) {
                    // Get specified DAO info
                    await Dao.findOne({ name: req.body.dao }).lean().then(dao => {
                        UserDao.aggregate([
                            {
                                $match: { badgeAddress: dao.badgeAddress }
                            },
                            {
                                $group: {
                                    _id: '$badgeAddress',
                                    sent: { $sum: "$received" }
                                }
                            },
                        ]).then(daoRelations => {
                            let sent = 0;
                            if (daoRelations && daoRelations.length) {
                                sent = daoRelations[0].sent;
                            }
                            dao['sent'] = sent;
                            return res.status(200).send({ success: true, data: [dao] });
                        }).catch(error => {
                            return res.status(200).send({ success: false, error: "Failed to find DAO: " + error.message });
                        })
                    }).catch(error => {
                        return res.status(200).send({ success: false, data: error.message });
                    });
                } else {
                    UserDao.aggregate([
                        {
                            $group: {
                                _id: '$badgeAddress',
                                sent: { $sum: "$received" }
                            }
                        },
                        {
                            $lookup: {
                                from: 'daos',
                                localField: '_id',
                                foreignField: 'badgeAddress',
                                as: 'dao'
                            }
                        },
                    ]).then(daos => {
                        for (let i = 0; i < daos.length; i++) {
                            let daoDetail = daos[i].dao ?
                                daos[i].dao.length ?
                                    daos[i].dao[0] :
                                    null :
                                null;
                            daos[i]['name'] = (daoDetail ? daoDetail.name : null);
                            daos[i]['badge'] = (daoDetail ? daoDetail.badge : null);
                            daos[i]['badgeAddress'] = (daoDetail ? daoDetail.badgeAddress : null);
                        }
                        controllerCommon.sort(daos, 'name', 1)
                        return res.status(200).send({ success: true, data: daos });
                    }).catch(error => {
                        return res.status(200).send({ success: false, error: "Failed to find DAO: " + error.message });
                    })
                }
            } catch (error) {
                return res.status(200).send({ success: false, data: error.message });
            }
        } else {    // System Account User
            try {
                // let topParent = await _getTopParentUser(req.body.master);
                if (req.body.dao) {
                    let daos = await Dao.find({ name: req.body.dao });
                    if (daos && daos.length) {
                        UserDao.aggregate([
                            {
                                $match: {
                                    badgeAddress: daos[0].badgeAddress
                                }
                            },
                            {
                                $group: {
                                    _id: '$badgeAddress',
                                    sent: { $sum: "$received" }
                                }
                            },
                        ]).then(userDaos => {
                            if (userDaos && userDaos.length) {
                                let dao = {
                                    badge: daos[0].badge,
                                    badgeAddress: daos[0].badgeAddress,
                                    name: daos[0].name,
                                    sent: userDaos[0].sent
                                };
                                return res.status(200).send({ success: true, data: [dao] });
                            } else {
                                return res.status(200).send({ success: true, data: [] });
                            }
                        });
                    } else {
                        return res.status(200).send({ success: true, data: [] });
                    }
                } else {
                    // Get all DAO for the user belongss to
                    try {
                        let myDaoList = await controllerCommon.getMyDAOs(req.body.master);
                        if (myDaoList === null) {
                            myDaoList = [];
                        }
                        for (let i = 0; i < myDaoList.length; i++) {
                            myDaoList[i]['name'] = myDaoList[i].dao;
                        }
                        controllerCommon.sort(myDaoList, 'name', 1)
                        return res.status(200).send({ success: true, data: myDaoList });
                    } catch (error) {
                        return res.status(200).send({ success: false, error: "Failed to find DAO: " + error.message });
                    }
                }
            } catch (error) {
                return res.status(200).send({ success: false, data: error });
            }
        }
    } catch (error) {
        console.error("UserController.getDaoData():", error);
        return res.status(200).send({ success: false, data: null });
    }
}

exports.getAllDaoData = async (req, res) => {
    console.log("getAllDaoData()");
    try {
        let user = await User.findOne({ wallet: req.body.master });
        if (user.userType === 0) {
            let daos = await User.find({});
            return res.status(200).send({ error: 0, data: daos });
        }
        return res.status(200).send({ error: -2, data: "Only super admin can access this function" });
    } catch (error) {
        console.error("UserController.getgetDaoData():", error);
        return res.status(200).send({ error: -1, data: null });
    }
}

exports.getSelOpList = (req, res) => {
    console.log("getSelOpList()");
    const result = {};
    fAction.aggregate([
        {
            $match: { parent: req.body.master }
        },
        {
            $group: { _id: "$name" }
        }
    ]).then((users) => {
        res.status(200).send(result);
    });
}

exports.update = async (req, res) => {
    console.log("UserController.update()");
    req.body.wallet = req.body.wallet.toLowerCase();
    User.findOne({ wallet: req.body.wallet }).then(async user => {
        var puser = user;
        let userType = 1;
        if (req.body._id == '') {
            // First registration
            if (user) {
                return res.status(200).send({ error: "ETH address duplicated!", success: false });
            }
            try {
                let ret = await User.findOne({ wallet: req.body.master });
                userType = ret.userType;
            } catch (error) {
                console.log(error);
            }
            // let topParentUser = _getTopParentUser(req.body.wallet);
            puser = new User({
                username: req.body.username,
                parent: req.body.master,
                wallet: req.body.wallet,
                userType: userType,
                status: req.body.status,
                created_at: Date.now()
            });
        } else {
            // In case of adding new contributor
            if (!puser) {
                return res.status(200).send({ error: "This accout does not exist!", success: false });
            }
            userType = 2; // Contributor
            try {
                let user = await User.findOne({ wallet: req.body.master });
                userType = user.userType;
            } catch (error) {
                console.log(error);
            }
            puser.username = req.body.username;
            puser.parent = req.body.parent;
            puser.wallet = req.body.wallet;
            puser.status = req.body.status;
            puser.userType = userType;
        }

        puser.save().then(async result => {
            // In case of admin contributor, no need to add USER-DAO relation
            if (userType && req.body.badgeAddress) {
                let userDao = new UserDao({
                    userAddress: result.wallet,
                    badgeAddress: req.body.badgeAddress,
                    received: 0,
                    isCreator: false,
                    created_at: Date.now()
                });
                let ret = await userDao.save();
                if (ret) {
                    console.log(ret.id);
                }
            }
            User.find({ parent: req.body.master }).then((users) => {
                res.status(200).send({ users: users, success: true });
            });
        }).catch((err) => {
            res.status(200).send({ success: false, error: "Error Occured!" + err.message });
        });
    });
}

exports.delete = async (req, res) => {
    console.log("UserController.delete()");
    User.findOne({ wallet: req.body.wallet }).then(user => {
        if (user === undefined || user === null) {
            return res.status(200).send({ success: false, data: "Failed to find specified user" });
        }
        if (user.isRoot) {
            return res.status(200).send({ success: false, data: "Couldn't delete super administrator" });
        }
        if (user.userType === 0) {
            // Admin
            User.deleteOne({ wallet: req.body.wallet }).then((user) => {
                User.find({ parent: req.body.master, wallet: req.body.master }).then(async users => {
                    try {
                        let master = await User.findOne({ wallet: req.body.master });
                        users.push(master);
                    } catch (error) {
                        console.log("Failed to get info for master: ", error.message)
                        return res.status(200).send({ success: false, data: "Failed to get information for the master:" + error.message });
                    }
                    res.status(200).send({ success: true, data: users });
                });
            });
        } else {
            // System Account user
            User.deleteOne({ wallet: req.body.wallet }).then(async user => {
                // Also delete User-Dao relation
                let ret = await UserDao.deleteOne({ userAddress: req.body.wallet });
                if (ret) {
                    console.log(ret);
                }
                // Refresh the user list
                _getUserList(req, res);
            });
            // Also delete User-Dao relation
        }
    }).catch(error => {
        return res.status(200).send({ success: false, data: error.message });
    });
}

