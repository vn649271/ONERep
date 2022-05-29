import React, { useState, useEffect } from "react";
import {connect} from "react-redux";
import { useDispatch } from "react-redux";
import { USERS } from "../store/actionTypes";
import Table from 'react-bootstrap/Table';
import { FaPencilAlt, FaUserAlt, FaTrashAlt, FaRegSave } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import ToggleButton from 'react-toggle-button';
import BasicModal from '../components/Modals/BasicModal';
import axios from 'axios';
import { SERVER_URL } from '../conf';
import SettingModule from './Settings';

const AdminModule = (props) => {

    const defaultUser = {
        _id: '',
        username: '',
        wallet: '',
        badge: '',
        dao: '',
        isAdmin: false,
        status: false,
        badgeAddress : '0x0000000000000000000000000000000000000000'
    }
    const [show, setShow] = useState(false);
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
    // const [chainId, setChainId] = useState(0);

    const dispatch = useDispatch();

    useEffect(() => {
        if (localStorage.getItem('wallet') === '' || !localStorage.getItem('wallet'))
        {
            window.location.href = "/";
            return;
        }
        if (!badgeAddress) {
            axios.post(
                SERVER_URL + '/users/loggedinuserbywallet', 
                {
                    wallet: localStorage.getItem("wallet")
                }
            ).then(ret => {
                console.log("Logged in user:", ret.data);
                setBadgeAddress(ret.data.badgeAddress);
                dispatch({
                    type: USERS.CONNECT_WALLET, 
                    payload: { 
                        wallet: ret.data.wallet,
                        user: ret.data.username,
                        isAdmin: ret.data.isAdmin,
                        badgeAddress: badgeAddress,
                    }
                });
                // setChainId(localStorage.getItem('chainId'));
            });            
        }
        getContributors();
    })
    const showMessageBox = (title, content, _type = "error") => {
        setMessageType(_type);
        setMessageTitle(title);
        setMessageContent(content);
        setShowMessage(true);
    }
    const handleClose = () => setShow(false);
    const handleCloseSettings = () => setShowSettings(false);
    const handleShow = (user) => {
        setCurUser(user);
        setShow(true);
    }
    const handleCloseMessageBox = () => {
        setShowMessage(false);
    }
    const handleDelete = (user) => {
        if (window.confirm("Are you sure to delete this contributor?"))
        {
            axios.post(SERVER_URL + '/users/delete', { ...user, master: localStorage.getItem("wallet") }).then(response => {
                setUsers(response.data);
            });
        }
    }
    const onClickSave = ev => {
        handleSave(ev);
    }
    const handleSave = async ev => {
        curUser.status = enable;
        
        try {
            let ret = await axios.post(
                SERVER_URL + '/users/loggedinuserbywallet', 
                {
                    wallet: localStorage.getItem("wallet")
                }
            );
            curUser.isAdmin = ret.isAdmin;
            console.log("The fetched user", ret);
            curUser.badgeAddress = ret.data.badgeAddress;
            curUser.dao = ret.data.dao;
            curUser.badge = ret.data.badge;
            console.log("current user", curUser)            
        } catch (error) {
            showMessageBox("Error", "Failed to verify this user");
            return;
        }

        try {
            let ret = await axios.post(
                SERVER_URL + '/users/update', 
                { 
                    ...curUser, 
                    master: localStorage.getItem("wallet")
                }
            );
            console.log("response", ret);
            if (ret.data.success)
                setUsers(ret.data.users);
            else
                alert(ret.data.error);            
        } catch (error) {
            showMessageBox("Error", "Failed to update information for the user");
            return;
        }
        window.location.reload(true);
    }

    const borderRadiusStyle = { borderRadius: 2, height: 40,}
   
    const getContributors = () => {
        let parent = localStorage.getItem("parent");
        if(parent === "" || parent === "undefined")
        {
            let walletAddress = localStorage.getItem("wallet");
            axios.post(SERVER_URL + '/users', { master: walletAddress }).then(response => {
                setUsers(response.data);
            });
        } else {
            axios.post(SERVER_URL + '/users', { master: parent }).then(response => {
                setUsers(response.data);
            });
        }
    }
    const onClickSettings = ev => {
        setShowSettings(true);
    }
    const themHandler = (val) => {
        setColor(val ? 'zl_light_theme_active' : 'zl_page_dark_mode');
        if(typeof window !== 'undefined') {
            localStorage.setItem("themColor", val ? 'zl_light_theme_active' : 'zl_page_dark_mode');
        }
    }
    
    return (
        <section className="">
            <br/><br/>
            <div className="zl_all_page_heading_section">
                <div className="zl_all_page_heading"><h2>My ONERep Account</h2></div>
                <div className="zl_all_page_notify_logout_btn">
                    <ul className="v-link">
                        <li><button className="btn-connect" onClick={onClickSettings}><FaPencilAlt /> Settings</button></li>
                        <li><button className="btn-connect" onClick={()=>{
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
            <div>
                <Table striped className="or-table table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>ETH Wallet</th>
                        <th>Are you admin?</th>
                        <th className="text-right">Reputation Awarded</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>{
                    users.map((item, i) => (
                        <tr key={i}>
                            <td><FaUserAlt/><span className="pl-2">{item.username}</span></td>
                            <td>{item.wallet}</td>
                            <td className="text-center">{item.isAdmin ? 'Admin' : '-'}</td>
                            <td className="text-right">{item.received}</td>
                            <td className="text-center">{!item.status?'Inactive':'Active'}</td>
                            <td className="text-center">
                                <div className="cursor-pointer flow-layout">
                                    <FaPencilAlt onClick={()=>{
                                        // setSAdmin(item.isAdmin);
                                        setEnable(item.status);
                                        handleShow(item)}
                                    }/> 
                                </div>
                                <div className="cursor-pointer flow-layout ml-20">
                                    <FaTrashAlt onClick={()=>{handleDelete(item)}} className="text-danger"/>
                                </div>
                            </td>
                        </tr>
                    ))
                    }</tbody>
                </Table>
            </div>
            <Modal centered show={showSettings} onHide={handleCloseSettings}>
                <Modal.Body>
                    <SettingModule themHandler={themHandler} />
                </Modal.Body>
            </Modal>

            <Modal centered show={show} onHide={handleClose}>
                <Modal.Body>
                    <div className="p-4">
                        <h5 className="text-center text-white">{curUser._id === '' ? "Add Contributor" : "Edit Contributor"}</h5>
                        <br/><br/>
                        <Form className="row">
                            <div className="col-md-12">
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <div className="text-center"><Form.Label className="text-muted-dark">Contributor Name</Form.Label></div>
                                    <Form.Control type="text" name="username" value={curUser.username} placeholder="" onChange={(e)=>{curUser.username = e.target.value}} required/>
                                </Form.Group>
                            </div>
                            <div className="col-md-12">
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <div className="text-center"><Form.Label className="text-muted-dark">Contributor ETH address</Form.Label></div>
                                    <Form.Control type="text" name="wallet" onChange={(e)=>{curUser.wallet = e.target.value}} value={curUser.wallet} placeholder="" />
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
                                    value={ enable|| false }
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
                                <div className="zl_securebackup_btn"><button type="button" onClick={onClickSave} className="mx-auto"><FaRegSave/><span className="ml-2">Save</span></button></div>
                            </div>
                        </Form>
                    </div>
                </Modal.Body>
            </Modal>
        </section>
    );
}

const mapStoreToProps = ({ userAction }) => ({});
export default connect(mapStoreToProps, null)(AdminModule);
