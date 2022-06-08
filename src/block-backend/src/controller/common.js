const fs = require('fs');
const fUserDao = require('../models/userdao');
const fDao = require('../models/dao');

exports.getMyDAOs = async myAddress => {
    try {
        let retList = await fUserDao.aggregate([
            {
                $match: { userAddress: myAddress }
            },
            {
                $group: {
                    _id: "$badgeAddress",
                    badgeAddress: { $first: "$badgeAddress" },
                    received: { '$sum': '$received' }
                }
            }
        ]);
        if (retList === undefined || retList === null ||
            retList.length === undefined || !retList.length) {
            return null;
        }
        for (let i in retList) {
            let fullDaoRelationInfo = await fUserDao.findOne({
                badgeAddress: retList[i]._id,
                isCreator: true
            }).lean();
            let daoInfo = await fDao.findOne({ badgeAddress: retList[i]._id }).lean();
            retList[i]['userAddress'] = fullDaoRelationInfo.userAddress;
            retList[i]['dao'] = daoInfo.name;
            retList[i]['badge'] = daoInfo.badge;
        }
        return retList;
    } catch (error) {
        return null;
    }
}

