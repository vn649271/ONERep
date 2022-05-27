import React, { useState, useEffect, useRef } from "react";
import { BigNumber, Signer } from "ethers";
import { connect } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { USERS } from "../store/actionTypes";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import StepProgressBar from "react-step-progress";
import ORFileImportWizard from "../components/Modals/ORFileImportWizard";
import UploadService from "../service/upload-files.service";
import { TESTNET_ADDRESS, MAINNET_ADDRESS } from "../shared/constants";
import ONERepDeployedInfo from "../shared/ONERep.json";
import ERC1238ReceiverMockDeployInfo from "../shared/ERC1238ReceiverMock.json";
import Papa from "papaparse";
import { create, CID, IPFSHTTPClient } from "ipfs-http-client";
import axios from "axios";
import $ from "jquery";
import ReactDOMServer from "react-dom/server";
import "react-step-progress/dist/index.css";
import { determineAddress, initContractByAddress } from "../service/contractService";
import Web3 from "web3";
import { ethers } from "ethers";
import { getMintApprovalSignature, orAlert } from "../service/utils";
import BasicModal from "../components/Modals/BasicModal";
const { SERVER_URL } = require("../conf");


const OneRepFileModule = (props) => {
  const { _wallet, _userName, _isAdmin, _badgeTokenAddress } = props;

  const [showMintWizard, setShowMintWizard] = useState(false);
  const [showSucces, setshowSucces] = useState(false);
  const [repfiles, setRepFiles] = useState([]);

  const [progress, setProgress] = useState(0);
  const [ipfsPath, setipfsPath] = useState("");
  const [ipfsName, setipfsName] = useState("");
  const [reputation, setReputation] = useState(0);
  const [showWatingModalForMint, setShowWatingModalForMint] = useState(false);
  const [images, setImages] = useState({ cid: CID, path: "" });
  const [totalMint, setTotalMint] = useState(0);
  const [file, setFile] = useState(null);
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

  let web3 = null;
  let rpcProvider = null;
  let signer = null;
  let step1Completed = false;

  const uploadFileInput = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    setWalletAddress(_wallet);
    setUserName(_userName);
    setBadgeTokenAddress(_badgeTokenAddress);
    let _chainId = localStorage.getItem('chainId');
    setChainId(_chainId);

    if (!walletAddress) {
      dispatch({
        type: USERS.CONNECT_WALLET, 
        payload: { 
          wallet: localStorage.getItem('wallet'),
          user: _userName,
          isAdmin: _isAdmin,
          badgeTokenAddress: _badgeTokenAddress
        }
      });
    }
  });

  useEffect(() => {
    // setShowWatingModalForMint(true);
    getOneRepFile();
    if (
      localStorage.getItem("wallet") === "" ||
      !localStorage.getItem("wallet")
    ) {
      window.location.href = "/";
      return;
    }
  }, [step]);

  const handleCloseMintWizard = () => setShowMintWizard(false);

  const handleCloseWatingModalForMint = () => setShowWatingModalForMint(false);
  
  const handleCloseMessageBox = () => setShowMessageBox(false);

  const handleShow = () => {
    setShowMintWizard(true);
    setFile(null);
    setTableRows([]);
    setValues([]);
    setStep(0);
    setProgress(0);
  };

  const handleCloseSuccess = () => setshowSucces(false);

  const handleShowSuccess = () => setshowSucces(true);

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
    setTotalMint(reputation);

    if (badgeTokenAddress === undefined ||
        badgeTokenAddress === null ||
        badgeTokenAddress === "") {
      orAlert("Invalid badge token address");
      return;        
    }

    setShowWatingModalForMint(true);
    /*******************************Creating Badge Contract Instance***************/
    const badgeTokenContract = new ethers.Contract(badgeTokenAddress, ONERepDeployedInfo.abi, rpcProvider);
    let wallet = localStorage.getItem('wallet')
    // let recipientcontractadd;

    /************Preparing an array of recipient contracts**********/
    var recipients = new Array(values.length);
    for (let j = 0; j < values.length; j++) {
      recipients[j] = values[j][2];
    }
    /***************************Mint to each individual Recipient Contract***********/
    let tokenAmount = 0;
    let totalTokenAmount = 0;
    for(let i = 0; i < values.length;i++) {
      tokenAmount = values[i][3];
      if (parseInt(tokenAmount) <= 0) {
        continue;
      }
      ////////////////////////////////////////////////////////
      try {
        let ret = await getMintApprovalSignature({
          web3,
          erc1238ContractAddress: badgeTokenAddress,
          chainId: chainId,
          signer: signer,
          id: 1,
          amount: tokenAmount,
          address: recipients[i]
        });
        if (ret.fullSignature === undefined || ret.fullSignature === null) {
          console.log("Failed to getMintApprovalSignature()", ret);
          continue;
        }
        let resp = await badgeTokenContract.connect(signer).mintToEOA(
          recipients[i],
          tokenAmount,
          ret.v, ret.r, ret.s,
          "https://your-domain-name.com/credentials/tokens/1",
          []
        );
        totalTokenAmount = tokenAmount;
      } catch (error) {
        let errorCode = error.code ? error.code : 0;
        if (errorCode === 4001) {
          setShowWatingModalForMint(false);
          return;
        }
        console.error("Failed to mintToEOA(): ", error);
      }
    }

    // console.log("Balance of recipient contract after");
    // for(let g = 0; g < recipients.length; g++){
    //   try {
    //     let bal = await badgeTokenContract.balanceOf(recipients[g]);
    //     console.log(recipients[g], "Balance(2): ", bal);        
    //   } catch (error) {
    //     console.log("Invalid member wallet address: ", recipients[g], error);
    //   }
    // }

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
    getOneRepFile();
    handleShowSuccess();
  };
  const getOneRepFile = () => {
    let parent = localStorage.getItem("parent");
    if(parent === "" || parent === "undefined") {
      axios.post(SERVER_URL + "/files", { master: localStorage.getItem("wallet") })
      .then((response) => {
        setRepFiles(response.data);
      });
    } else {
      axios.post(SERVER_URL + "/files", { master: localStorage.getItem("parent") })
      .then((response) => {
        setRepFiles(response.data);
      });
    }
  };
  const onSubmitHandler = (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    setFile(files[0]);
    let prefix = "data__" + Date.now() + "__";
    setipfsName(files[0].name);
    setipfsPath(prefix + files[0].name);
    UploadService.upload(files[0], prefix, (event) => {
      setProgress(Math.round((100 * event.loaded) / event.total));
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

  return (
    <section className="">
      <br />
      <br />
      <div className="zl_all_page_heading_section">
        <div className="zl_all_page_heading">
          <h2>ONERep Files (Cordinape)</h2>
        </div>
        <div className="zl_all_page_notify_logout_btn">
          <ul className="v-link">
            <li>
              <button onClick={handleShow} className="btn-connect">
                Add ONERep File
              </button>
            </li>
          </ul>
        </div>
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
      <div>
        <Table striped className="or-table table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>IPFS URI</th>
              <th className="text-right">Reputation</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {repfiles.map((row, i) => (
              <tr key={i}>
                <td>{row.filename}</td>
                <td><a href={`${SERVER_URL}` + "/uploads/" + row.ipfsuri}>{row.ipfsuri}</a></td>
                <td className="text-right">{row.reputation}</td>
                <td>{row.status ? "Completed" : "Failed"}</td>
                <td>{
                  new Date(row.created_at).toLocaleDateString() + 
                  " " + 
                  new Date(row.created_at).toLocaleTimeString()
                }</td>
              </tr>
            ))}
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
        _userName: state.userAction.user,
        _wallet: state.userAction.wallet,
        _isAdmin: state.userAction.isAdmin,
        _badgeTokenAddress: state.userAction.badgeTokenAddress
    };
}

export default connect(mapStoreToProps)(OneRepFileModule);
