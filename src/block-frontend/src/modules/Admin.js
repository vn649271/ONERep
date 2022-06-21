import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { USERS } from "../store/actionTypes";
import { FaPencilAlt, FaUserAlt, FaTrashAlt, FaRegSave } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import ToggleButton from 'react-toggle-button';
import BasicModal from '../components/Modals/BasicModal';
import axios from 'axios';
import { SERVER_URL } from '../conf';
import SettingModule from './Settings';
import OrConfirm from '../components/Modals/OrConfirm';
import { orAlert } from "../service/utils";
import OrTable from "../components/OrTable";
import Web3 from "web3";
import { ethers } from "ethers";
import ONERepDeployedInfo from "../shared/ONERep.json";

let web3 = null;
let rpcProvider = null;
let signer = null;

/*
 *************************************** 
 * Data definition for user table 
 *************************************** 
 */
const userTableHeaderInfo = [
    { label: "Name", name: "username" },
    { label: "DAO", name: "daoName" },
    { label: "ETH Wallet", name: "wallet" },
    { label: "Is Admin?", name: "userType" },
    {
        label: <div className="text-right">
                    <div>Reputation</div>
                    <div>Awarded</div>
                </div>,
        name: "received", className: "text-right"
    },
    { label: "Status", name: "status" },
];
const refineTableData = rawTableData => {
    let userList = expandUserList(rawTableData);
    let _userList = [];
    for (let i in userList) {
        let _user = userList[i];
        _userList.push({
            "username": { content: <div text={_user.username}><FaUserAlt /><span className="pl-2">{_user.username}</span></div> },
            "daoName": { content: _user.daoName },
            "wallet": { content: _user.wallet },
            "userType": { className: "text-center", content: _user.userType === 0 ? 'Admin' : '-' },
            "received": { className: "text-right", content: _user.received },
            "status": { className: "text-center", content: !_user.status ? 'Inactive' : 'Active' }
        });
    }
    return _userList;
}
const expandUserList = userListNested => {
    let userList = [];
    if (userListNested && userListNested.length) {
        for (let i in userListNested) {
            let userInfo = userListNested[i];
            if (userInfo && userInfo.daos && userInfo.daos.length) {
                for (let j in userInfo.daos) {
                    userInfo['daoName'] = userInfo.daos[j].name;
                    userInfo['received'] = userInfo.daos[j].received;
                    userList.push(userInfo);
                }
            } else {
                userInfo['daoName'] = "";
                userInfo['received'] = "";
                userList.push(userInfo);
            }
        }
    }
    return userList;
}

/*
 *************************************** 
 ********** Admin page  ****************
 *************************************** 
 */
 const AdminModule = (props) => {

    const defaultUser = {
        _id: '',
        username: '',
        wallet: '',
        badge: '',
        dao: '',
        isAdmin: false,
        status: false,
        badgeAddress: '0x0000000000000000000000000000000000000000'
    }
    const [showContributorEditDialog, setShowContributorEditDialog] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    // const [admin, setSAdmin] = useState(false);
    const [enable, setEnable] = useState(false);
    const [users, setUsers] = useState([]);
    const [curUser, setCurUser] = useState(defaultUser);
    const [color, setColor] = useState('zl_page_dark_mode');
    const [showMessage, setShowMessage] = useState(false);
    const [messageType, setMessageType] = useState("error");
    const [messageTitle, setMessageTitle] = useState("");
    const [messageContent, setMessageContent] = useState("");
    const [badgeAddress, setBadgeAddress] = useState(null);
    const [_userName, setUserName] = useState(null);
    const [_wallet, setWallet] = useState(null);
    const [inited, setInited] = useState(false);
    const [chainId, setChainId] = useState(0);

    const [confirmContext, setConfirmContext] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        if (localStorage.getItem('wallet') === '' || !localStorage.getItem('wallet')) {
            window.location.href = "/";
            return;
        }
        if (!inited) {
            axios.post(
                SERVER_URL + '/users/loggedinuserbywallet',
                {
                    wallet: localStorage.getItem("wallet")
                }
            ).then(ret => {
                setInited(true);
                console.log("Logged in user:", ret.data);
                let badgeAddress = null;
                if (
                    ret.data &&
                    ret.data.data &&
                    ret.data.data.daoRelation &&
                    ret.data.data.daoRelation.length
                ) {
                    badgeAddress = ret.data.data.daoRelation[0].badgeAddress;
                }
                setBadgeAddress(badgeAddress);
                let userInfo = ret.data.data;
                if (userInfo === undefined || userInfo === null) {
                    window.location.href = "/";
                    return;
                }
                dispatch({
                    type: USERS.CONNECT_WALLET,
                    payload: {
                        wallet: userInfo.wallet,
                        user: userInfo.username,
                        isAdmin: (userInfo.userType === 0),
                        badgeTokenAddress: badgeAddress,
                    }
                });
            });
            setChainId(localStorage.getItem('chainId'));
        }
        if (!users || users.length === undefined || !users.length) {
            getContributors();
        }
    })
    const openConfirm = (text, context) => {
        setConfirmContext(context);
        setConfirmText(text);
        setShowConfirm(true);
    }
    const closeConfirm = (ret, context) => {
        setShowConfirm(false);
        if (ret) {
            if (context && context.onCloseWithYes) {
                context.onCloseWithYes(context ? context.params ? context.params : null : null);
            }
        }
    }
    const showMessageBox = (title, content, _type = "error") => {
        setMessageType(_type);
        setMessageTitle(title);
        setMessageContent(content);
        setShowMessage(true);
    }
    const handleClose = () => setShowContributorEditDialog(false);
    const handleCloseSettings = () => setShowSettings(false);
    const handleShow = (user) => {
        setCurUser(user);
        let currentUserName = user.username ? 
                                user.username.content ? 
                                    user.username.content.props ? 
                                        user.username.content.props.text ? 
                                            user.username.content.props.text:
                                        "":
                                    "":
                                "":
                            "";
        setUserName(currentUserName);
        let currentUserWallet = user.wallet ? user.wallet.content ? user.wallet.content : "" : "";
        setWallet(currentUserWallet);
        setShowContributorEditDialog(true);
    }
    const handleCloseMessageBox = () => {
        setShowMessage(false);
    }
    const onClickSave = ev => {
        handleSave(ev);
    }
    const InitWeb3 = async () => {
        if (web3 == null && window.ethereum) {
            web3 = new Web3(window.ethereum);
            rpcProvider = new ethers.providers.Web3Provider(window.ethereum)
            signer = rpcProvider.getSigner();
        }
    }
    const addContributorOnChain = async (contributorAddress) => {
        await InitWeb3();
        if (web3 == null || chainId == null) {
          orAlert("Initialization not complete yet. Please try again a while later");
          return;
        }
        if (badgeAddress === undefined ||
            badgeAddress === null ||
            badgeAddress === "") 
        {
            orAlert("Invalid badge token address");
            return;
        }
        const badgeTokenContract = new ethers.Contract(badgeAddress, ONERepDeployedInfo.abi, rpcProvider);
        try {
            let gasPrice = await web3.eth.getGasPrice();
            if (gasPrice === null || gasPrice === "" || parseInt(gasPrice) <= 0) {
                orAlert("deployBadgeContract(): Failed to get the current value of gas price");
                return null;
            }

            const accounts = await web3.eth.getAccounts();
            // const ret = await badgeTokenContract.addOwner({ 
            //     // data: ONERepDeployedInfo.bytecode, 
            //     arguments:[
            //         contributorAddress
            //     ] 
            // }).send({ 
            //     from: accounts[0], 
            //     gasPrice: gasPrice 
            // });
            let ret = await badgeTokenContract.connect(signer).addOwner(contributorAddress, {
                gasLimit: 1000000
            });
            //
            // console.log("Onchain-function addContributorOnChain():", ret)
            return true;
        } catch (error) {
            orAlert("Failed to add contributor to on-chain:" + error.message);
            return false;
        }

    }
    const removeContributorOnChain = async (contributorAddress) => {
        await InitWeb3();
        if (web3 == null || chainId == null) {
          orAlert("Initialization not complete yet. Please try again a while later");
          return;
        }
        if (badgeAddress === undefined ||
            badgeAddress === null ||
            badgeAddress === "") 
        {
            orAlert("Invalid badge token address");
            return;
        }
        const badgeTokenContract = new ethers.Contract(badgeAddress, ONERepDeployedInfo.abi, rpcProvider);
        try {
            let gasPrice = await web3.eth.getGasPrice();
            if (gasPrice === null || gasPrice === "" || parseInt(gasPrice) <= 0) {
                orAlert("deployBadgeContract(): Failed to get the current value of gas price");
                return null;
            }
            const accounts = await web3.eth.getAccounts();
            let ret = await badgeTokenContract.connect(signer).removeOwner(contributorAddress, {
                gasLimit: 100000
            });
            //
            // console.log("Onchain-function addContributorOnChain():", ret)
            return true;
        } catch (error) {
            orAlert("Failed to add contributor to on-chain:" + error.message);
            return false;
        }
    }
    const handleSave = async ev => {
        curUser.status = enable;
        curUser.username = _userName;
        curUser.wallet = _wallet;
        let _badgeAddress = null;

        try {
            let ret = await axios.post(
                SERVER_URL + '/users/loggedinuserbywallet',
                {
                    wallet: localStorage.getItem("wallet")
                }
            );
            if (
                ret.status !== 200 ||
                ret.data === undefined ||
                ret.data === null ||
                ret.data.data === undefined ||
                ret.data.data === null
            ) {
                orAlert("Failed to get user information by wallet address");
                return;
            }
            curUser.userType = ret.data.data.userType;
            _badgeAddress = ret.data.data.daoRelation ?
                    ret.data.data.daoRelation.length ?
                        ret.data.data.daoRelation[0].badgeAddress :
                        null :
                    null
            setBadgeAddress(_badgeAddress);
            // curUser.dao = ret.data.data.dao;
            // curUser.badge = ret.data.data.badge;
        } catch (error) {
            showMessageBox("Error", "Failed to verify this user");
            return;
        }

        try {
            if (_badgeAddress) {
                let ret = await addContributorOnChain(curUser.wallet);
                if (!ret) {
                    return;
                }
            }
            let ret = await axios.post(
                SERVER_URL + '/users/update',
                {
                    ...curUser,
                    badgeAddress: _badgeAddress,
                    master: localStorage.getItem("wallet")
                }
            );
            console.log("response", ret);
            if (ret.data.success) {
                setUsers(refineTableData(ret.data.users));
            } else {
                alert(ret.data.error);
            }
        } catch (error) {
            showMessageBox("Error", "Failed to update information for the user");
            return;
        }
        window.location.reload(true);
    }

    const borderRadiusStyle = { borderRadius: 2, height: 40, }

    const getContributors = async () => {
        await axios.post(
            SERVER_URL + '/users',
            {
                master: localStorage.getItem("wallet")
            }
        ).then(response => {
            let users = response.data ? response.data.data ? response.data.data : [] : [];
            let success = response.data ? response.data.success ? response.data.success : false : false;
            if (success) {
                setUsers(refineTableData(users));
            }
        });
    }
    const onClickSettings = ev => {
        setShowSettings(true);
    }
    const themHandler = (val) => {
        setColor(val ? 'zl_light_theme_active' : 'zl_page_dark_mode');
        if (typeof window !== 'undefined') {
            localStorage.setItem("themColor", val ? 'zl_light_theme_active' : 'zl_page_dark_mode');
        }
    }
    const handleEditRow = row => {
        // setSAdmin(row.userType === 0);
        setEnable(row.status);
        handleShow(row)
    }
    const handleDeleteRow = row => {
        if (row.wallet.content === localStorage.getItem('wallet')) {
            showMessageBox("Warning", "Couldn't remove yourself");
            return;
        }
        handleDelete(row.wallet.content)
    }
    const handleDelete = (user) => {
        openConfirm("Are you sure to delete this contributor?", {
            onCloseWithYes: _handleDelete,
            params: user
        });
    }
    const _handleDelete = async user => {
        let ret = await removeContributorOnChain(user);
        if (!ret) {
            showMessageBox("Warning", "Failed to remove specified contributor on-chain");
            return;
        }

        axios.post(SERVER_URL + '/users/delete', { wallet: user, master: localStorage.getItem("wallet") }).then(response => {
            let success = response.data ? response.data.success ? response.data.success : false : false;
            let retData = response.data ? response.data.data ? response.data.data : null : null;
            if (success) {
                if (retData === null || retData.length < 1) {
                    window.location.href = "/";
                    return;
                }
                setUsers(refineTableData(retData));
                orAlert("Successfully deleted the user");
                return;
            }
            orAlert(retData ? retData : "");
        });
    }

    return (
        <section className="">
            <br /><br />
            <div className="zl_all_page_heading_section">
                <div className="zl_all_page_heading"><h2>My ONERep Account</h2></div>
                <div className="zl_all_page_notify_logout_btn">
                    <ul className="v-link">
                        <li><button className="btn-connect" onClick={onClickSettings}><FaPencilAlt /> Settings</button></li>
                        <li><button className="btn-connect" onClick={() => {
                            // setSAdmin(false)
                            setEnable(false)
                            handleShow(defaultUser)
                        }}>Add Contributor</button></li>
                    </ul>
                </div>
            </div>
            <BasicModal
                show={showMessage}
                modalType={messageType}
                title={messageTitle}
                closeModal={handleCloseMessageBox}
            >
                <p className="text-white">{messageContent}</p>
            </BasicModal>
            <OrConfirm
                show={showConfirm}
                context={confirmContext}
                closeConfirm={closeConfirm}
            >
                {confirmText}
            </OrConfirm>
            <OrTable
                name="user-table"
                columns={userTableHeaderInfo}
                editable={true}
                removable={true}
                methods={{
                    onEditRow: handleEditRow,
                    onDeleteRow: handleDeleteRow
                }}
                rows={users}
            />
            <Modal centered show={showSettings} onHide={handleCloseSettings}>
                <Modal.Body>
                    <SettingModule themHandler={themHandler} />
                </Modal.Body>
            </Modal>

            <Modal centered show={showContributorEditDialog} onHide={handleClose}>
                <Modal.Body>
                    <div className="p-4">
                        <h5 className="text-center text-white">{curUser._id === '' ? "Add Contributor" : "Edit Contributor"}</h5>
                        <br /><br />
                        <Form className="row">
                            <div className="col-md-12">
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <div className="text-center"><Form.Label className="text-muted-dark">Contributor Name</Form.Label></div>
                                    <Form.Control type="text" name="username" value={_userName} placeholder="" onChange={(e) => setUserName(e.target.value)} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-12">
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <div className="text-center"><Form.Label className="text-muted-dark">Contributor ETH address</Form.Label></div>
                                    <Form.Control type="text" name="wallet" value={_wallet} onChange={(e) => setWallet(e.target.value)} placeholder="" />
                                </Form.Group>
                            </div>
                            {/*{<div className="col-md-6">
                            
                                localStorage.getItem('isAdmin') === "true" && ([
                                    <Form.Label key="form-label-elem" className="text-muted-dark">Is Super Admin?</Form.Label>,
                                    <ToggleButton
                                        key="toggle-btn-elem"
                                        name="isAdmin"
                                        value={true}
                                        inactiveLabel="No"
                                        activeLabel="Yes"
                                        thumbStyle={borderRadiusStyle}
                                        trackStyle={borderRadiusStyle}
                                        onToggle={(value) => {
                                            setSAdmin(true);
                                        }} 
                                    />
                                ])
                            }
                            </div>*/}
                            <div className="col-md-6">
                                <Form.Label className="text-muted-dark">Enable</Form.Label>
                                <ToggleButton
                                    name="status"
                                    value={enable || false}
                                    inactiveLabel="No"
                                    activeLabel="Yes"
                                    thumbStyle={borderRadiusStyle}
                                    trackStyle={borderRadiusStyle}
                                    onToggle={value => {
                                        setEnable(!value);
                                    }}
                                />
                            </div>
                            <div className="col-12 text-center">
                                <div className="zl_securebackup_btn"><button type="button" onClick={onClickSave} className="mx-auto"><FaRegSave /><span className="ml-2">Save</span></button></div>
                            </div>
                        </Form>
                    </div>
                </Modal.Body>
            </Modal>
        </section >
    );
}

const mapStoreToProps = ({ userAction }) => ({});
export default connect(mapStoreToProps, null)(AdminModule);
