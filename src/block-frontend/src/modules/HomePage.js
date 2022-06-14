import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { connect } from "react-redux";
import { ethers, utils } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { USERS } from "../store/actionTypes";
import { useHistory } from "react-router-dom";
import BasicModal from '../components/Modals/BasicModal';
import OrSpinButton from '../components/OrSpinButton';
import { orAlert } from "../service/utils";
import axios from "axios";
import { 
  SERVER_URL,
  CHAIN_NAME,
  CHAIN_ID,
  BLOCK_EXPLORER_URLS,
  RPC_URLS
} from "../conf";
import Web3 from "web3";

console.log("Server URL: ", SERVER_URL);


const HomePageModule = (props) => {

  const [data, setdata] = useState({
    address: "",
    Balance: null,
  });
  const [show, setShow] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState("error");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");

  let history = useHistory();
  const dispatch = useDispatch();

  let mounted = false;
  
  useEffect(() => {
    mounted = true;

    return () => {
      mounted = false;
    }
  });

  const handleClose = () => setShow(false);

  const handleShow = () => {
    if (window.ethereum) {
      setShow(true);
    } else {
      showMessageBox("Warning", "No wallet installed. You should have wallet installed to access the page");
    }
  }
  // const error = useSelector(({ userAction }) => userAction.error);

  const showMessageBox = (title, content, _type = "error") => {
    setMessageType(_type);
    setMessageTitle(title);
    setMessageContent(content);
    setShowMessage(true);
  }

  const handleCloseMessageBox = () => {
    setShowMessage(false);
  }

  const connectWallet = async (params) => {
    if (window.ethereum) {
      // res[0] for fetching a first wallet
      await window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async res => {
          await accountChangeHandler(res[0])
          params.stopWait();
        });
    } else {
      showMessageBox("Warning", "No wallet installed. You should have wallet installed to access the page");
    }
  };

  // Function for login
  //commit
  const accountLogin = (account) => {
    
    console.log("accountLogin():", SERVER_URL);

    axios.post(
      SERVER_URL + "/users/login",
      {
        wallet: account
      }
    ).then((response) => {
      if (response.data.success == true) {
        localStorage.setItem("user", response.data.username);
        localStorage.setItem("wallet", account);
        localStorage.setItem("isAdmin", (response.data.userType === 0));
        localStorage.setItem("parent", response.data.parent);
        console.log("parent", response.data.parent);

        dispatch({
          type: USERS.CONNECT_WALLET,
          payload: {
            wallet: account,
            user: response.data.username,
            isAdmin: (response.data.userType === 0),
            badgeTokenAddress: response.data.badgeTokenAddress,
            // chainId: chainId
          }
        });
        history.push(response.data.url);
      } else {
        orAlert(response.data.data);
        history.push(response.data.url);
      }
    }).catch(error => {
      console.log("Failed to login:", error);
    });
  };

  const attachHarmoneyChain = (account) => {
    try {
      window.ethereum
        .request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainName: CHAIN_NAME,
              chainId: utils.hexValue(CHAIN_ID),
              nativeCurrency: {
                name: "ONE",
                symbol: "ONE",
                decimals: 18,
              },
              blockExplorerUrls: BLOCK_EXPLORER_URLS,
              rpcUrls: RPC_URLS,
            },
          ],
        })
        .then((res) => {
          setdata({
            address: account,
          });
          getbalance(account);
          accountLogin(account);
          return;
        });
    } catch (addError) {
      console.error(addError);
    }
  }
  // Function for getting handling all events
  const accountChangeHandler = async account => {
    try {
      let web3 = new Web3(window.ethereum);
      let chainId = await web3.eth.net.getId();
      if (chainId !== CHAIN_ID) {
        // If not Harmony chain
        attachHarmoneyChain(account);
      }
      localStorage.setItem("chainId", chainId);

      window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: utils.hexValue(chainId) }], // chainId must be in hexadecimal numbers
        })
        .then((res) => {
          console.log("res:", res);
          setdata({
            address: account,
          });
          getbalance(account);
          accountLogin(account);
        })
        .catch((error) => {
          if (error.code === 4902) {
            attachHarmoneyChain(account);
          }
        });
    } catch (error) { }
  };

  // getbalance function for getting a balance in
  // a right format with help of ethers
  const getbalance = (address) => {
    // Requesting balance method
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      .then((balance) => {
        // Setting balance
        if (mounted) {
          setdata({
            address: address,
            Balance: ethers.utils.formatEther(balance),
          });
        }
      });
  };

  return (
    <section className="">
      <BasicModal
        show={showMessage}
        modalType={messageType}
        title={messageTitle}
        closeModal={handleCloseMessageBox}
      >
        <p className="text-white">{messageContent}</p>
      </BasicModal>
      <div className="text-right">
        <div className="zl_securebackup_btn">
          <button onClick={handleShow} className="mx-auto" href="#">
            Connect your wallet
          </button>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <h2 className="header-1 text-center">Track your DAO Reputation</h2>
      <div className="header-small text-center text-muted">
        Connect your wallet to participate
      </div>
      <br />
      <br />
      <div className="text-center">
        <ul className="v-link">
          <li className="text-muted-dark">ONERep</li>
          <li className="text-muted-dark">Discord</li>
          <li className="text-muted-dark">Twitter</li>
          <li className="text-muted-dark">Docs</li>
        </ul>
      </div>

      <Modal centered show={show} onHide={handleClose}>
        <Modal.Body>
          <div className="p-4">
            <h5 className="text-center text-white">Connect your wallet</h5>
            <br />
            <br />
            <div className="text-center">
              <OrSpinButton
                renderMode={'overlapped'}
                size='large'
                onClick={connectWallet}
              >
                <span color="text-white">
                  Metamask{" "}
                  <img className="" src="assets/image/metamask.svg" />
                </span>
              </OrSpinButton>
            </div>
            <br />
            <br />
            <p className="text-center text-muted">
              <small>
                New to something <a href="#">Link for this</a>
              </small>
            </p>
          </div>
        </Modal.Body>
      </Modal>
    </section>
  );
};
const mapStoreToProps = ({ userAction }) => ({});
export default connect(mapStoreToProps, null)(HomePageModule);
