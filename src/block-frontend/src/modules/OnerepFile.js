import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { USERS } from "../store/actionTypes";
import Dropdown from "react-bootstrap/Dropdown";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import ORFileImportWizard from "../components/Modals/ORFileImportWizard";
import UploadService from "../service/upload-files.service";
import ONERepDeployedInfo from "../shared/ONERep.json";
import Papa from "papaparse";
// import { CID } from "ipfs-http-client";
import axios from "axios";
import "react-step-progress/dist/index.css";
import Web3 from "web3";
import { ethers } from "ethers";
import { getMintBatchApprovalSignature, orAlert } from "../service/utils";
import BasicModal from "../components/Modals/BasicModal";
const { SERVER_URL } = require("../conf");


const OneRepFileModule = (props) => {
  // const { _wallet, _userName, _isAdmin, _badgeTokenAddress } = props;

  const [showMintWizard, setShowMintWizard] = useState(false);
  const [showSucces, setshowSucces] = useState(false);
  const [showFailure, setshowFailure] = useState(false);
  const [repfiles, setRepFiles] = useState([]);
  const [daoList,setDaoList] = useState([]);
  const [selectedDao, setSelectedDao] = useState(null);
  const [selectedDaoTokenTotalSupply, setSelectedDaoTokenTotalSupply] = useState(0);
  // const [progress, setProgress] = useState(0);
  const [ipfsPath, setipfsPath] = useState("");
  const [ipfsName, setipfsName] = useState("");
  const [reputation, setReputation] = useState(0);
  const [showWatingModalForMint, setShowWatingModalForMint] = useState(false);
  // const [images, setImages] = useState({ cid: CID, path: "" });
  // const [totalMint, setTotalMint] = useState(0);
  // const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [csvData, setCSVData] = useState([]);
  //State to store table Column name
  const [tableRows, setTableRows] = useState([]);
  //State to store the values
  const [values, setValues] = useState([]);
  const [step, setStep] = useState(0);
  const [badgeTokenAddress, setBadgeTokenAddress] = useState(null);
  const [badgecontract,setBadgeContract] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxTitle, setMessageBoxTitle] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [userName, setUserName] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initedIsAdmin, setInitedIsAdmin] = useState(false);
  const [mintFailureReason, setMintFailureReason] = useState("");

  let web3 = null;
  let rpcProvider = null;
  let signer = null;
  let step1Completed = false;

  const uploadFileInput = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    let _isAdmin = localStorage.getItem("isAdmin");
    if (_isAdmin !== "undefined" && !initedIsAdmin) {
      setIsAdmin(_isAdmin === "true"?true:false);
      setInitedIsAdmin(true);
    }
    if (!badgeTokenAddress) {
      axios.post(
        SERVER_URL + '/users/loggedinuserbywallet', 
        {
          wallet: localStorage.getItem("wallet")
        }
      ).then(ret => {
        let userInfo = ret.data ? ret.data : null;
        if (!userInfo) {
          orAlert("Failed to get information for current logined user");
          return;
        }
        // console.log("Logged in user:", ret.data);
        setIsAdmin(userInfo.isAdmin);
        setInitedIsAdmin(true);
        let badgeTokenAddress = userInfo.badgeAddress;
        setBadgeTokenAddress(badgeTokenAddress);
        setChainId(localStorage.getItem('chainId'));
        dispatch({
          type: USERS.CONNECT_WALLET, 
          payload: { 
              wallet: userInfo.wallet,
              user: userInfo.username,
              isAdmin: userInfo.isAdmin,
              badgeTokenAddress: badgeTokenAddress,
          }
        });
        // Init DAO drop down
        let thisAddress = localStorage.getItem("wallet");
        // Get all DAO names to fill into DAO name list and select first DAO from it
        axios.post(SERVER_URL + "/getDaoData", {
          master: thisAddress
        }).then((resp)=> {
          if (resp.data.error !== undefined && resp.data.error === 0) {
            let daos = resp.data.data;
            if (userInfo.isAdmin) {
              daos = [
                {
                  _id: '',
                  dao: 'All'
                },
                ...daos
              ];
            }
            setDaoList(daos);
            if (userInfo.isAdmin) {
              handleDropDown(null);
            } else {
              handleDropDown(daos[0].dao);
            }
          } else {
            alert("Failed to get DAO data");
          }
        });        
      })
      .catch(error => {
        orAlert("OneRepFile: Failed to get information for logged in user: " + error.message);        
      });
    }
  });
  useEffect(() => {
    // setShowWatingModalForMint(true);
    loadOneRepFiles();
    if (
      localStorage.getItem("wallet") === "" ||
      !localStorage.getItem("wallet")
    ) {
      window.location.href = "/";
      return;
    }
  }, [step]);

  const filterContractMessage = (originMessage) => {
    let contractErrorReqExp = /[a-zA-Z\ ]+;[a-zA-Z\ ]+\[[a-zA-Z\:\/\/\-_\.0-9 ]+\] \(reason=\"([a-zA-Z \:]+)\",.+/;
    let msgElems = originMessage.match(contractErrorReqExp);
    if (msgElems.length > 1) {
      return msgElems[1].replace("execution reverted:", "");
    }
    return originMessage;
  }
  const handleCloseMintWizard = () => setShowMintWizard(false);
  const handleCloseWatingModalForMint = () => setShowWatingModalForMint(false);
  const handleCloseMessageBox = () => setShowMessageBox(false);
  const handleShow = () => {
    setShowMintWizard(true);
    // setFile(null);
    setTableRows([]);
    setValues([]);
    setStep(0);
    // setProgress(0);
  };
  const handleCloseSuccess = () => setshowSucces(false);
  const handleCloseFailure = () => setshowFailure(false);
  const handleShowSuccess = () => setshowSucces(true);
  const handleShowFailure = (reason) => {
    setMintFailureReason(reason);
    setshowFailure(true);
  }
  const inform = (title, content) => {
    setMessageBoxTitle(title);
    setMessageBoxContent(content);
    setShowMessageBox(true);
  }
  const InitWeb3 = async () => {
    if (web3 == null && window.ethereum) {
      web3 = new Web3(window.ethereum);
      rpcProvider = new ethers.providers.Web3Provider(window.ethereum)
      signer = rpcProvider.getSigner();
    }
  }
  const handleSubmit = async () => {
    await InitWeb3();
    if (web3 == null || chainId == null) {
      orAlert("Initialization not complete yet. Please try again a while later");
      return;
    }
    setShowMintWizard(false);
    // setTotalMint(reputation);

    if (badgeTokenAddress === undefined ||
        badgeTokenAddress === null ||
        badgeTokenAddress === "") {
      orAlert("Invalid badge token address");
      return;        
    }

    setShowWatingModalForMint(true);
    /*******************************Creating Badge Contract Instance***************/
    const badgeTokenContract = new ethers.Contract(badgeTokenAddress, ONERepDeployedInfo.abi, rpcProvider);
    // let wallet = localStorage.getItem('wallet')
    // let recipientcontractadd;

    /***************************Mint to each individual Recipient Contract***********/

    ////////////////////////////////////////////////////////
    try {
      let idsList = [];
      let toList = [];
      let amountsList = [];
      let tokenUrisList = [];
      let dataList = [];

      for(let i = 0; i < values.length;i++) {
        let tokenAmount = values[i][3];
        if (parseInt(tokenAmount) <= 0) {
          continue;
        }
        let amounts = [];
        amounts.push(tokenAmount)
        // Get signature for each 
        let ret = await getMintBatchApprovalSignature({
          web3,
          erc1238ContractAddress: badgeTokenAddress,
          chainId: chainId,
          signer: signer,
          amounts: amounts,
          recipient: values[i][2]
        });
        if (ret.fullSignature === undefined || ret.fullSignature === null) {
          console.log("Failed to getMintApprovalSignature()", ret);
          continue;
        }
        toList.push(values[i][2]);
        amountsList.push(amounts);
        let tokenUris = [];
        tokenUris.push("https://your-domain-name.com/credentials/tokens/1");
        tokenUrisList.push(tokenUris);
        dataList.push(ret.fullSignature);
        idsList.push([1]);
      }

      let resp = await badgeTokenContract.connect(signer).mintBundle(
        toList,
        idsList,
        amountsList,
        tokenUrisList,
        dataList
      );
      if (resp) {
        console.log(resp);
      }
      /****************************adding information of uploaded files in the mongodb */
      let ret = await axios.post(SERVER_URL + "/files/add", {
        filename: ipfsName,
        ipfsuri: ipfsPath,
        status: true,
        reputation: reputation,
        data: values,
        master: localStorage.getItem("wallet"),
      });
      setShowWatingModalForMint(false);
      if (ret.data === undefined || ret.data === null ||
          ret.data.success === undefined) {
        orAlert("Failed to save file");
        return;
      }
      loadOneRepFiles();
      handleShowSuccess();
    } catch (error) {
      setShowWatingModalForMint(false);
      let msg = filterContractMessage(error.message);
      handleShowFailure(msg);
      let errorCode = error.code ? error.code : 0;
      if (errorCode === 4001) {
        return;
      }
      console.error("Failed to mintToEOA(): ", error);
    }
  };
  const loadOneRepFiles = (selectedDaoName = null) => {
    let parent = localStorage.getItem("parent");
    if(parent === "" || parent === "undefined") {
      axios.post(SERVER_URL + "/files", { master: localStorage.getItem("wallet"), dao: selectedDaoName })
      .then((response) => {
        if (response.data.error) {
          orAlert("Failed to load ONERep files: " + response.data.data);
          return;
        }
        setRepFiles(response.data.data);
      });
    } else {
      axios.post(SERVER_URL + "/files", { master: localStorage.getItem("parent"), dao: selectedDaoName })
      .then((response) => {
        if (response.data.error) {
          orAlert("Failed to load ONERep files: " + response.data.data);
          return;
        }
        setRepFiles(response.data.data);
      });
    }
  };
  const onSubmitHandler = (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    // setFile(files[0]);
    let prefix = "data__" + Date.now() + "__";
    setipfsName(files[0].name);
    setipfsPath(prefix + files[0].name);
    UploadService.upload(files[0], prefix, (event) => {
      // setProgress(Math.round((100 * event.loaded) / event.total));
    })
    .then((response) => {
      inform("Inform", response.data.message);
      step1Completed = true;
      Papa.parse(files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rowsArray = [];
          const valuesArray = [];

          setCSVData(results.data);

          // Iterating data to get column name and their values
          let rep = 0;
          results.data.map((d) => {
            rowsArray.push(Object.keys(d));
            valuesArray.push(Object.values(d));
            rep += parseInt(d.received);
            return true;
          });
          setReputation(rep);
          // Parsed Data Response in array format
          setParsedData(results.data);

          // Filtered Column Names
          setTableRows(rowsArray[0]);

          // Filtered Values
          // setValues([...values, ...valuesArray]);
          setValues(valuesArray);
        },
      });

      // this.setState({
      // message: response.data.message,
      // });
      // return UploadService.getFiles("data");
    })
    .then((files) => {
      // this.setState({
      // fileInfos: files.data,
      // });
    })
    .catch((err) => {
      this.setState({
        progress: 0,
        message: "Could not upload the file!",
        currentFile: undefined,
      });
    });
  };
  const onChangedFileUploadInput = (ev) => {
    onSubmitHandler(ev);
  }
  const handleDropDown = async (selectedDaoName) => {
    try {
      let getDaoDataReqParam = {
        master: localStorage.getItem("wallet"),
        dao: selectedDaoName === "All"? null: selectedDaoName
      };
      // let isAdmin = localStorage.getItem("isAdmin");
      // if (isAdmin) {
      //   getDaoDataReqParam = {
      //     master: localStorage.getItem("wallet"),
      //   };
      // }
      let resp = await axios.post(SERVER_URL + "/getDaoData", getDaoDataReqParam);
      let daos = resp.data.data;
      let selectedDao = null;
      daos.map(dao => {
        if (dao.dao === selectedDaoName) {
          selectedDao = dao;
          return true;
        }
        return false
      })
      setSelectedDao(selectedDao);
      if (selectedDao) {
        setSelectedDaoTokenTotalSupply(selectedDao.sent);
        loadOneRepFiles(selectedDao.dao);
      } else {
        loadOneRepFiles();
      }
    } catch (error) {
      console.log("Error occurred in handleDropDown()", error);
    }
  }
  return (
    <section className="">
      <br />
      <br />
      <div className="zl_all_page_heading_section">
        <div className="zl_all_page_heading">
          <h2>ONERep Files (Cordinape)</h2>
        </div>
        {
          !isAdmin ? 
            <div className="zl_all_page_notify_logout_btn">
              <ul className="v-link">
                <li>
                  <button onClick={handleShow} className="btn-connect">
                    Add ONERep File
                  </button>
                </li>
              </ul>
            </div>:
            <></>
        }
      </div>
      {
        showMintWizard?
          <ORFileImportWizard
            onClose={handleCloseMintWizard}
            stepActions={[
              onChangedFileUploadInput,
              null,
              handleSubmit
            ]}
            stepData={[
              {},
              {
                values,
                reputation,
                tableRows
              },
              {}
            ]}
          />:
        <></>
      }
      <div className='main-text-color'>
        <div className='flow-layout mr-20'>
          <div className='flow-layout mr-10'>DAO</div>
          <div className='flow-layout mr-10'>
          {
            isAdmin ?
            <Dropdown onSelect={handleDropDown}>
              <Dropdown.Toggle variant="dropdown" id="dropdown-basic">
                {selectedDao? selectedDao.dao ? selectedDao.dao: "All": "All"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
              {
                (daoList.length > 0) ? 
                  daoList.map(m => {
                    return <Dropdown.Item key={m.dao} eventKey={m.dao}>{m.dao}</Dropdown.Item>          
                  }): 
                  <Dropdown.Item eventKey={daoList.dao}>{daoList.dao}</Dropdown.Item>  
              }
              </Dropdown.Menu>
            </Dropdown>:
            <label className="bordered-label">{selectedDao? selectedDao.dao ? selectedDao.dao: "Select DAO": "Select Dao"}</label>
          }
          </div>
        </div>
        {
          selectedDao ? ([
              <div key="badge-token-name-label" className='flow-layout mr-20'>
                Token Name
                <label className="bordered-label">
                  {selectedDao ? selectedDao.badge ? selectedDao.badge: " ": " "}
                </label>
              </div>,
              <div key="badge-token-total-supply-label" className='flow-layout mr-10'>
                Number of Tokens 
                <label className="bordered-label">
                  {selectedDaoTokenTotalSupply}
                </label>
              </div>
            ]): 
            <></>
        }
      </div>
      <br/>
      <div>
        <Table striped className="or-table table">
          <thead>
            <tr>
              <th>DAO</th>
              <th>File Name</th>
              <th>IPFS URI</th>
              <th className="text-right">Reputation</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
          {
            repfiles.length > 0? repfiles.map((row, i) => (
              <tr key={i}>
                <td>{row.userInfo?row.userInfo.length?row.userInfo[0].dao:"":""}</td>
                <td>{row.filename}</td>
                <td><a href={`${SERVER_URL}/uploads/${row.ipfsuri}`}>{row.ipfsuri}</a></td>
                <td className="text-right">{row.reputation}</td>
                <td>{row.status ? "Completed" : "Failed"}</td>
                <td>{
                  new Date(row.created_at).toLocaleDateString() + 
                  " " + 
                  new Date(row.created_at).toLocaleTimeString()
                }</td>
              </tr>
            )): <tr><td colSpan="5" className="text-center main-text-color-second"><i>No Data</i></td></tr>
          }
          </tbody>
        </Table>
      </div>
      {/******************* "Minted Successfully" Dialog *********************/}
      <Modal centered show={showSucces} onHide={handleCloseSuccess}>
        <Modal.Body>
          <div className="p-4">
            <br />
            <h4 className="text-center text-white">
              Successfully <br /> Minted
            </h4>
            <br />
            <br />
            <div className="text-center">
              <button
                type="button"
                className="btn-connect"
                onClick={handleCloseSuccess}
              >
                Okay Got it
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {/******************* "Minted Failure" Dialog *********************/}
      <Modal centered show={showFailure} onHide={handleCloseFailure}>
        <Modal.Body>
          <div className="p-4">
            <br />
            <h4 className="text-center text-white">
              Failed to Mint
            </h4>
            <br />
            <p className="main-text-color text-center">
              {mintFailureReason}
            </p>
            <br />
            <div className="text-center">
              <button
                type="button"
                className="btn-connect"
                onClick={handleCloseFailure}
              >
                Got it
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {/******************* "Minting..." Dialog *********************/}
      <Modal centered className="w-fit-content" show={showWatingModalForMint} onHide={handleCloseWatingModalForMint}>
        <Modal.Body className="">
          <div className="or-waiting-modal-body">
            <div className="or-waiting-modal-spinner mr-2">
              <div className="or-spin-border-white spinner-border" role="status" />
            </div>
            <div className="or-waiting-modal-text main-text-color">
              Minting... Please wait a while.
            </div>            
          </div>
        </Modal.Body>
      </Modal>
      {/******************* Message Dialog *********************/}
      <BasicModal show={showMessageBox} modalType="success" title={messageBoxTitle} closeModal={handleCloseMessageBox}>
        <p className="text-white">{messageBoxContent}</p>
      </BasicModal>
      {/*************************************************************/}
    </section>
  );
};

function mapStoreToProps(state) {
    return { 
    //     _userName: state.userAction.user,
    //     _wallet: state.userAction.wallet,
    //     _isAdmin: state.userAction.isAdmin,
    //     _badgeTokenAddress: state.userAction.badgeTokenAddress
    };
}

export default connect(mapStoreToProps)(OneRepFileModule);
