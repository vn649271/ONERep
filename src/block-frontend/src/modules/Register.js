import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import Form from 'react-bootstrap/Form';
import { deployBadgeContract } from "../service/contractService";
import { SERVER_URL } from "../conf";
import { orAlert } from "../service/utils";
import Web3 from "web3";
import OrSpinButton from "../components/OrSpinButton";
import BasicModal from "../components/Modals/BasicModal";
import axios from 'axios';

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

const RegisterModule = (props) => {

    const [wallet, setWallet] = useState('');
    const [status, setStatus] = useState(IDLE); // IDLE, PENDING
    const [userName, setUserName] = useState("");
    const [badgeSymbol, setBadgeSymbol] = useState("");
    const [_badgeTokenAddress, setBadgeTokenAddress] = useState("");
    const [daoName, setDaoName] = useState("");
    const [errorUserName, setErrorUserName] = useState("");
    const [errorBadgeName, setErrorBadgeName] = useState("");
    const [errorDaoName, setErrorDaoName] = useState("");
    // Modal-related state variables
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("error"); // 0: Error, 1: Warning, 2: Success
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [isFirstRegister, setIsFirstRegister] = useState(false);
    const [isInited, setIsInited] = useState(false);
    
    const registerForm = useRef();

    useEffect(() => {
        let walletAddress = localStorage.getItem('wallet');
        setWallet(walletAddress);
        if (!isInited) {
            axios.get(SERVER_URL + '/users', {excludeInactive: true}).then(response => {
                let nUsers = response.data ? response.data.data ? response.data.data : 0 : 0;
                if (nUsers < 1) {
                    setIsFirstRegister(true);
                } else {
                    setIsFirstRegister(false);
                }
                setIsInited(true);
            });
        }
    }, [wallet]);

    /******************************Deploy badge contract from entered user information************/
    const onSubmitHandler = async params => {
        let stopWait = params.stopWait;
        console.log("inside handler")
        // e.preventDefault();
        if (userName === '') {
            setErrorUserName('Invalid user name');
            stopWait();
            return;
        }
        if (!isFirstRegister && badgeSymbol === null) {
            setErrorBadgeName('Invalid badge token name');
            stopWait();
            return;
        }
        if (!isFirstRegister && daoName === null) {
            setErrorDaoName('Invalid DAO name');
            stopWait();
            return;
        }

        let web3 = new Web3(window.ethereum);
        let address1;

        try {
            if (badgeSymbol) {
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
                let badgeTokenAddress = await deployBadgeContract(web3, badgeSymbol);
                setBadgeTokenAddress(badgeTokenAddress);
                stopWait();
                setStatus(IDLE);
                if (badgeTokenAddress === null) {
                    warning("Failed to deploy badge token for you. Please try again");
                    return;
                }
                registerDao(daoName, badgeSymbol, badgeTokenAddress);
            }
            localStorage.setItem("user", userName);
            localStorage.setItem("wallet", wallet);
            inform("Success", "DAO Token deployed, please proceed to launch ONERep Account");
        } catch (error) {
            stopWait();
            orAlert(error.message);
        }
    }
    const registerDao = async (name, badgeSymbol, badgeAddress) => {
        axios.post(SERVER_URL + "/daos/register", { name: name, badge: badgeSymbol, badgeAddress: badgeAddress })
        .then((response) => {
            if (response.data.success == true) {
                localStorage.setItem("dao", name);
                localStorage.setItem("daoId", response.data.data);
                localStorage.setItem("badge", badgeSymbol);
                localStorage.setItem("badgeTokenAddress", badgeAddress);
            } else {
                orAlert(response.data.error);
            }
        });
    };


    const handleUserInput = (ev) => {
        const name = ev.target.name;
        const value = ev.target.value;
        if (name === 'userName') {
            setErrorUserName('');
            setUserName(ev.target.value);
        } else if (name === 'badge') {
            setErrorBadgeName('');
            setBadgeSymbol(ev.target.value);
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
    const onClickRegister = ev => {
        if (registerForm.current){
            registerForm.current.submit();
        }
    }

    return (
        <section className="">
            <br /><br />
            <BasicModal show={showModal} modalType={modalType} title={modalTitle} closeModal={handleCloseModal}>
                <p className="text-white">{modalMessage}</p>
            </BasicModal>
            <h2 className="header-1 text-center">Create a ONERep Account</h2>
            <br /><br />
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <Form ref={registerForm} action={SERVER_URL + "/users/register"} method="post">
                        <div className="row mb-40">
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <div className="text-center">
                                        <Form.Label className="text-muted-dark">User Name</Form.Label>
                                    </div>
                                    <Form.Control 
                                        className={errorUserName !== '' ? "invalid-content" : ""} 
                                        type="text" 
                                        name="userName" 
                                        placeholder="" 
                                        value={userName} 
                                        onChange={handleUserInput} 
                                        required 
                                        readOnly={status === PENDING ? true : false} 
                                    />
                                    <div className='error-tooltip'>{errorUserName}</div>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="formBasicText">
                                    <div className="text-center">
                                        <Form.Label className="text-muted-dark">Address</Form.Label>
                                    </div>
                                    <Form.Control 
                                        type="text" 
                                        value={wallet} 
                                        name="wallet" 
                                        placeholder="" 
                                        onChange={onChangeAddress} 
                                        required 
                                        readOnly
                                    />
                                </Form.Group>
                            </div>
                            {
                                isFirstRegister ?
                                    <></> :
                                    <>
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formBasicText">
                                                <div className="text-center">
                                                    <Form.Label className="text-muted-dark">Badge Name</Form.Label>
                                                </div>
                                                <Form.Control 
                                                    className={ errorBadgeName !== '' ? "invalid-content" : "" } 
                                                    type="text" 
                                                    name="badge" 
                                                    placeholder="" 
                                                    value={badgeSymbol} 
                                                    onChange={handleUserInput} 
                                                    required 
                                                    readOnly={status == PENDING ? true : false} 
                                                />
                                                <div className='error-tooltip'>{errorBadgeName}</div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formBasicText">
                                                <div className="text-center">
                                                    <Form.Label className="text-muted-dark">DAO Name</Form.Label>
                                                </div>
                                                <Form.Control 
                                                    className={errorDaoName !== '' ? "invalid-content" : ""} 
                                                    type="text" 
                                                    name="dao" 
                                                    placeholder="" 
                                                    value={daoName} 
                                                    onChange={handleUserInput} 
                                                    required 
                                                    readOnly={status === PENDING ? true : false} 
                                                />
                                                <div className='error-tooltip'>{errorDaoName}</div>
                                            </Form.Group>
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3" controlId="formBasicText">
                                                <div className="text-center">
                                                    <Form.Label className="text-muted-dark">Badge Address</Form.Label>
                                                </div>
                                                <Form.Control 
                                                    type="text" 
                                                    name="tokenAddress" 
                                                    value={_badgeTokenAddress}
                                                    placeholder="" 
                                                    required readOnly 
                                                />
                                            </Form.Group>
                                        </div>
                                        <div className="col-12 text-center">
                                            <div className="zl_securebackup_btn">
                                                <OrSpinButton
                                                    onClick={onSubmitHandler}
                                                >Deploy Token
                                                </OrSpinButton>
                                            </div>
                                        </div>
                                    </>
                            }
                            <div className="col-12 text-center">
                                <div className="zl_securebackup_btn">
                                    {
                                        <OrSpinButton
                                            onClick={onClickRegister}
                                            disabled={status === PENDING}
                                        >Launch this ONERep
                                        </OrSpinButton>
                                    }
                                </div>
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
export default connect(mapStoreToProps, null)(RegisterModule);
