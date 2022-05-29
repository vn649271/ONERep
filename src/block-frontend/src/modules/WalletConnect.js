import React, { useState, useEffect } from "react";
import {connect} from "react-redux";
import Form from 'react-bootstrap/Form';
import { deployBadgeContract } from "../service/contractService";
import { SERVER_URL } from "../conf";
import Web3 from "web3";
import OrSpinButton from "../components/OrSpinButton";
import BasicModal from "../components/Modals/BasicModal";

// This function detects most providers injected at window.ethereum
// import detectEthereumProvider from '@metamask/detect-provider';

// const provider = await detectEthereumProvider();

// if (provider) {
//   // From now on, this should always be true:
//   // provider === window.ethereum
//   startApp(provider); // initialize your app
// } else {
//   console.log('Please install MetaMask!');
// }
const IDLE = 0, PENDING = 1;

const WalletConnectModule = (props) => {

    const [wallet, setWallet] = useState('');
    const [status, setStatus] = useState(IDLE); // IDLE, PENDING
    const [userName, setUserName] = useState("");
    const [badgeTokenName, setBadgeTokenName] = useState("");
    const [daoName, setDaoName] = useState("");
    const [errorUserName, setErrorUserName] = useState("");
    const [errorBadgeName, setErrorBadgeName] = useState("");
    const [errorDaoName, setErrorDaoName] = useState("");
    // Modal-related state variables
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("error"); // 0: Error, 1: Warning, 2: Success
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");

    useEffect(() => {
        setWallet(localStorage.getItem('wallet'));
    }, [wallet]);
    
    /******************************Deploy badge contract from entered user information************/
    const onSubmitHandler = async params => {
        let stopWait = params.stopWait;
        console.log("inside handler")
       // e.preventDefault();
        let badgeTokenAddress = "";
        let userNameBox = document.getElementsByName("username");
        let userName = userNameBox[0].value;
        if (userName === '') {
            setErrorUserName('Invalid user name');
            stopWait();
            return;
        }

        let wallet1 = document.getElementsByName("wallet");

        let badge1 = document.getElementsByName("badge");;
        let badgeName = badge1[0].value;
        if (badgeName === '') {
            setErrorBadgeName('Invalid badge token name');
            stopWait();
            return;
        }

        let dao1 = document.getElementsByName("dao");
        let daoName = dao1[0].value;
        if (daoName === '') {
            setErrorDaoName('Invalid DAO name');
            stopWait();
            return;
        }

        let web3 = new Web3(window.ethereum);
        let address1;

        try {
            const accounts = await web3.eth.getAccounts();
            if (
                accounts === undefined || accounts === null || 
                accounts.length < 1 || accounts[0] === null
            ) {
                warning("No selected account for you");
                stopWait();
                return;
            }
            setStatus(PENDING);
            badgeTokenAddress = await deployBadgeContract(web3);
            stopWait();
            setStatus(IDLE);
            if (badgeTokenAddress === null) {
                warning("Failed to deploy badge token for you. Please try again");
                return;
            }
            document.getElementsByName("tokenaddress")[0].value = badgeTokenAddress;

            localStorage.setItem("user", userName);
            localStorage.setItem("badge", badgeName);
            localStorage.setItem("badgeTokenAddress", badgeTokenAddress);
            localStorage.setItem("dao", daoName);
            localStorage.setItem("wallet", wallet1[0].value);
            inform("Success", "DAO Token deployed, please proceed to launch ONERep Account");
            console.log(">>>>>>>>>>>>>>>>>>>>> New deployed badge token address:", badgeTokenAddress);
        } catch (error) {
            console.log("!!!!!!!!!!!!! Error occurred in onSubmitHandler(): ", error);
        }
    }
    const handleUserInput = (ev) => {
        const name = ev.target.name;
        const value = ev.target.value;
        if (name === 'username') {
            setErrorUserName('');
            setUserName(ev.target.value);
        } else if (name === 'badge') {
            setErrorBadgeName('');
            setBadgeTokenName(ev.target.value);
        } else if (name === 'dao') {
            setErrorDaoName('');
            setDaoName(ev.target.value);
        }
    }
    const inform = (title, message) => {
        setModalTitle(title);
        setModalMessage(message);
        setModalType('success');
        setShowModal(true);
    }
    const warning = (message) => {
        setModalTitle("Warning");
        setModalMessage(message);
        setModalType('error');
        setShowModal(true);
    }
    const handleCloseModal = () => {
        setShowModal(false)
    }
    const onChangeAddress = ev => {
        console.log("Wallet address changed: ", ev.target.value);
    }

    return (
        <section className="">
            <br/><br/>
            <BasicModal show={showModal} modalType={modalType} title={modalTitle} closeModal={handleCloseModal}>
                <p className="text-white">{modalMessage}</p>
            </BasicModal>
            <h2 className="header-1 text-center">Create a ONERep Account</h2>
            <br/><br/>
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <Form className="row mb-40" action={SERVER_URL + "/users/register"} method="post">
                        <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <div className="text-center"><Form.Label className="text-muted-dark">User Name</Form.Label></div>
                                <Form.Control className={errorUserName !== ''? "invalid-content": ""} type="text" name="username" placeholder="" value={userName} onChange={handleUserInput} required readOnly={status === PENDING?true: false}/>
                                <div className='error-tooltip'>{errorUserName}</div>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="formBasicText">
                                <div className="text-center"><Form.Label className="text-muted-dark">Address</Form.Label></div>
                                <Form.Control type="text" value={wallet} name="wallet" placeholder="" onChange={onChangeAddress} required readOnly/>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="formBasicText">
                                <div className="text-center"><Form.Label className="text-muted-dark">Badge Name</Form.Label></div>
                                <Form.Control className={errorBadgeName !== ''? "invalid-content": ""} type="text" name="badge" placeholder="" value={badgeTokenName} onChange={handleUserInput} required readOnly={status == PENDING?true: false}/>
                                <div className='error-tooltip'>{errorBadgeName}</div>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="formBasicText">
                                <div className="text-center"><Form.Label className="text-muted-dark">DAO Name</Form.Label></div>
                                <Form.Control className={errorDaoName !== ''? "invalid-content": ""} type="text" name="dao" placeholder="" value={daoName} onChange={handleUserInput} required readOnly={status === PENDING?true: false}/>
                                <div className='error-tooltip'>{errorDaoName}</div>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="formBasicText">
                                <div className="text-center"><Form.Label className="text-muted-dark">Badge Address</Form.Label></div>
                                {/* <Form.Label name="tokenaddress"></Form.Label> */}
                                <Form.Control type="text" name="tokenaddress" placeholder="" required readOnly />
                            </Form.Group>
                        </div>
                        <div className="col-12 text-center">
                            <div className="zl_securebackup_btn">
{/*                                <button 
                                    type="button"  
                                    onClick={onSubmitHandler} 
                                    className="mx-auto"
                                >Deploy Token</button>
*/}
                                <OrSpinButton 
                                    onClick={onSubmitHandler}
                                >Deploy Token
                                </OrSpinButton>
                            </div>
                        </div>
                        <div className="col-12 text-center">
                            <div className="zl_securebackup_btn">
                            {
                                status === PENDING?
                                    <button 
                                        type="submit"  
                                        className="mx-auto"
                                        disabled
                                    >Launch this ONERep</button>:
                                    <button 
                                        type="submit"  
                                        className="mx-auto"
                                    >Launch this ONERep</button>
                            }
                            </div>
                        </div>
                    </Form>
                </div>
            </div>

        </section>
    );
}
const mapStoreToProps = ({ userAction }) => ({
});
export default connect(mapStoreToProps, null)(WalletConnectModule);
