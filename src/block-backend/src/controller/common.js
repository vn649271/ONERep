const fs = require('fs');
const fUserDao = require('../models/userDao');
const fDao = require('../models/dao');
const fUser = require('../models/user');

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
            let creatorInfo = await fUser.findOne({wallet: fullDaoRelationInfo.userAddress});
            retList[i]['sent'] = creatorInfo ? creatorInfo.sent ? creatorInfo.sent : 0: 0;
            let daoInfo = await fDao.findOne({ badgeAddress: retList[i]._id }).lean();
            retList[i]['userAddress'] = fullDaoRelationInfo.userAddress;
            retList[i]['dao'] = daoInfo ? daoInfo.name ? daoInfo.name : null : null;
            retList[i]['badge'] = daoInfo ? daoInfo.badge ? daoInfo.badge : null : null;
        }
        return retList;
    } catch (error) {
        return null;
    }
}

exports.sort = (arr, field, direction) => {
    arr.sort((a, b) => {
        if (a[field] === b[field]) {
            return 0;
        }
        else {
            return (a[field] < b[field]) ? -1 * direction : direction;
        }
    });
}

