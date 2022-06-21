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
import { getMintBatchApprovalSignature, orAlert, handleDST } from "../service/utils";
import BasicModal from "../components/Modals/BasicModal";
import OrSpinner from "../components/OrSpinner";
import OrTable from "../components/OrTable";
const { SERVER_URL } = require("../conf");

/*
 ***************************************
 ********* ONERep File page  **********
 *************************************** 
 */
const OneRepFileModule = (props) => {
  // const { _wallet, _userName, _isAdmin, _badgeTokenAddress } = props;

  const [showMintWizard, setShowMintWizard] = useState(false);
  const [showSucces, setshowSucces] = useState(false);
  const [showFailure, setshowFailure] = useState(false);
  const [repfiles, setRepFiles] = useState([]);
  const [daoList, setDaoList] = useState([]);
  const [selectedDao, setSelectedDao] = useState(null);
  const [selectedDaoTokenTotalSupply, setSelectedDaoTokenTotalSupply] = useState(0);
  // const [progress, setProgress] = useState(0);
  const [ipfsPath, setipfsPath] = useState("");
  const [ipfsName, setipfsName] = useState("");
  const [reputation, setReputation] = useState(0);
  const [showWatingModalForMint, setShowWatingModalForMint] = useState(false);
  const [sort_dao, setSortDao] = useState(1);
  const [sort_filename, setSortFileName] = useState(1);
  const [sort_uri, setSortUri] = useState(1);
  const [sort_reputation, setSortReputation] = useState(1);
  const [sort_status, setSortStatus] = useState(1);
  const [sort_date, setSortDate] = useState(1);
  const [sort_option, setSortOption] = useState({ reputation: -1 });
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
  const [badgecontract, setBadgeContract] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxTitle, setMessageBoxTitle] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState(false);
  const [messageBoxType, setMessageBoxType] = useState("error");
  const [walletAddress, setWalletAddress] = useState(null);
  const [userName, setUserName] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFileImportable, setIsFileImportable] = useState(false);
  const [initedIsAdmin, setInitedIsAdmin] = useState(false);
  const [mintFailureReason, setMintFailureReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [inited, setInited] = useState(false);

  let web3 = null;
  let rpcProvider = null;
  let signer = null;
  let step1Completed = false;

  const uploadFileInput = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    let _isAdmin = localStorage.getItem("isAdmin");
    if (_isAdmin !== "undefined" && !initedIsAdmin) {
      setIsAdmin(_isAdmin === "true" ? true : false);
      setInitedIsAdmin(true);
    }
    if (!inited) {
      axios.post(
        SERVER_URL + '/users/loggedinuserbywallet',
        {
          wallet: localStorage.getItem("wallet")
        }
      ).then(ret => {
        let userInfo = ret.data ? ret.data ? ret.data.data : null : null;
        if (!userInfo) {
          orAlert("Failed to get information for current logined user");
          logout();
          return;
        }
        setInited(true);
        // console.log("Logged in user:", ret.data);
        setIsAdmin(userInfo.userType === 0);
        setIsFileImportable(userInfo.userType === 1);
        setInitedIsAdmin(true);
        let badgeTokenAddress = userInfo.daoRelation ?
          userInfo.daoRelation.length ?
            userInfo.daoRelation[0].badgeAddress :
            null :
          null;
        setBadgeTokenAddress(badgeTokenAddress);
        setChainId(localStorage.getItem('chainId'));
        dispatch({
          type: USERS.CONNECT_WALLET,
          payload: {
            wallet: userInfo.wallet,
            user: userInfo.username,
            isAdmin: userInfo.userType === 0,
            badgeTokenAddress: badgeTokenAddress,
          }
        });
        // Init DAO drop down
        let thisAddress = localStorage.getItem("wallet");
        // Get all DAO names to fill into DAO name list and select first DAO from it
        axios.post(SERVER_URL + "/getDaoData", {
          master: thisAddress
        }).then((resp) => {
          if (resp.data.success) {
            let daos = resp.data.data;
            if (userInfo.userType !== 1) {
              daos = [
                {
                  _id: '',
                  badgeAddress: null,
                  name: 'All'
                },
                ...daos
              ];              
            }
            setDaoList(daos);
            if (userInfo.userType === 1 && daos.length) {
              handleDropDown(daos[0].name, daos);
            } else {
              handleDropDown('All');
            }
          } else {
            alert("Failed to get DAO data");
          }
        });
      }).catch(error => {
        orAlert("OneRepFile: Failed to get information for logged in user: " + error.message);
      });
    }
  });
  // useEffect(() => {
  //   // setShowWatingModalForMint(true);
  //   loadOneRepFiles();
  //   if (
  //     localStorage.getItem("wallet") === "" ||
  //     !localStorage.getItem("wallet")
  //   ) {
  //     window.location.href = "/";
  //     return;
  //   }
  // }, [step]);

  useEffect(() => {
    setSortOption({dao: sort_dao});
  }, [sort_dao]);
  useEffect(() => {
    setSortOption({filename: sort_filename});
  }, [sort_filename]);
  useEffect(() => {
    setSortOption({ipfsuri: sort_uri});
  }, [sort_uri]);
  useEffect(() => {
    setSortOption({reputation: sort_reputation});
  }, [sort_reputation]);
  useEffect(() => {
    setSortOption({status: sort_status});
  }, [sort_status]);
  useEffect(() => {
    setSortOption({created_at: sort_date});
  }, [sort_date]);

  const onSortDao = ev => {
    setSortDao(-sort_dao);
  }
  const onSortFileName = ev => {
    setSortFileName(-sort_filename);
  }
  const onSortUri = ev => {
    setSortUri(-sort_uri);
  }
  const onSortReputation = ev => {
    setSortReputation(-sort_reputation);
  }
  const onSortStatus = ev => {
    setSortStatus(-sort_status);
  }
  const onSortDate = ev => {
    setSortDate(-sort_date);
  }
  /*
  ******************************************
  * Data definition for ONERep Board Table 
  ****************************************** 
  */
  const fileTableHeaderInfo = [
    { label: "DAO", name: "dao", sortable: true, clickHandler: onSortDao },
    { label: "File Name", name: "fileName", sortable: true, clickHandler: onSortFileName },
    { label: "IPFS URI", name: "ipfsUrl", className: "text-center", sortable: true, clickHandler: onSortUri },
    { label: "Reputation", name: "reputation", className: "text-right", sortable: true, clickHandler: onSortReputation },
    { label: "Status", name: "status", className: "text-center", sortable: true, clickHandler: onSortStatus },
    { label: "Date", name: "created_at", className: "text-center", sortable: true, clickHandler: onSortDate },
  ];
  const refineTableData = rawTableData => {
    let _boardDataList = [];
    for (let i in rawTableData) {
      let r = rawTableData[i];
      _boardDataList.push({
        "dao": { content: r.dao },
        "fileName": { content: r.filename },
        "ipfsUrl": { content: <a href={`${SERVER_URL}/uploads/${r.ipfsuri}`}>{r.ipfsuri}</a> },
        "reputation": { className: "text-right", content: r.reputation },
        "status": { className: "text-center", content: r.status ? "Completed" : "Failed" },
        "created_at": {
          className: "text-center",
          content: new Date(r.created_at).toLocaleDateString() +
            " " +
            new Date(r.created_at).toLocaleTimeString()
        },
      });
    }
    return _boardDataList;
  }

  const logout = async () => {
    localStorage.setItem("wallet", "");
    localStorage.setItem('user', "");
    localStorage.setItem("isAdmin", false);
    window.location.href = "/";
  }
  const filterContractMessage = (originMessage) => {
    let contractErrorReqExp = /[a-zA-Z\ ]+;[a-zA-Z\ ]+\[[a-zA-Z\:\/\/\-_\.0-9 ]+\] \(reason=\"([a-zA-Z \:]+)\",.+/;
    let msgElems = originMessage.match(contractErrorReqExp);
    if (msgElems === null) {
      return originMessage;
    }
    if (msgElems.length !== undefined && msgElems.length > 1) {
      return msgElems[1].replace("execution reverted:", "");
    }
    return originMessage;
  }
  const handleCloseMintWizard = () => setShowMintWizard(false);
  const handleCloseWatingModalForMint = () => setShowWatingModalForMint(false);
  const handleCloseMessageBox = () => setShowMessageBox(false);
  const handleTriggerFileImportWizard = () => {
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
  const inform = (title, content, type = 'error') => {
    setMessageBoxType(type);
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

      let minter = localStorage.getItem("wallet");
      for (let i = 0; i < values.length; i++) {
        let tokenAmount = values[i][3];
        if (parseInt(tokenAmount) <= 0) {
          continue;
        }
        let amounts = [];
        amounts.push(tokenAmount)
        /////////////////////////////////////////////////////////////////////
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
      let gasPrice = await web3.eth.getGasPrice();
      if (gasPrice === null || gasPrice === "" || parseInt(gasPrice) <= 0) {
        setShowWatingModalForMint(false);
        orAlert("deployBadgeContract(): Failed to get the current value of gas price");
        return null;
      }
      gasPrice = gasPrice * 1.5;
      let estimatedGas = await badgeTokenContract.connect(signer).estimateGas.mintBundle(
        toList,
        idsList,
        amountsList,
        tokenUrisList,
        dataList
      );
      if (estimatedGas === undefined ||
          estimatedGas === null ||
          isNaN(estimatedGas.toString())) 
      {
        setShowWatingModalForMint(false);
        orAlert("deployBadgeContract(): Failed to get the current value of gas limitation");
        return null;
      }
      estimatedGas = (estimatedGas.toString() - 0) * 2;
      let resp = await badgeTokenContract.connect(signer).mintBundle(
        toList,
        idsList,
        amountsList,
        tokenUrisList,
        dataList, 
        {
          gasLimit: estimatedGas,
          gasPrice: gasPrice
        }
      );

      if (resp === undefined || resp === null ||
        resp.wait === undefined || resp.wait === null) 
      {
        setShowWatingModalForMint(false);
        handleShowFailure("Failed to mint badge token. Please contact administrator.");
        return;
      }
      let ret = await resp.wait();
      console.log(ret);
      /****************************adding information of uploaded files in the mongodb */
      ret = await axios.post(SERVER_URL + "/files/add", {
        filename: ipfsName,
        ipfsuri: ipfsPath,
        status: true,
        reputation: reputation,
        data: values,
        master: minter,
      });

      if (ret.data === undefined || ret.data === null ||
          ret.data.success === undefined || !ret.data.success) 
      {
        setShowWatingModalForMint(false);
        orAlert("Failed to save file");
        return;
      }
      handleDropDown(daoList[0].name, daoList);
      setShowWatingModalForMint(false);
      // loadOneRepFiles(selectedDao ? selectedDao.badgeAddress ? selectedDao.badgeAddress : null : null);
      inform("Success", "Successfully Minted", "success");

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
  const loadOneRepFiles = (badgeAddressForSelectedDao = null) => {
    setLoading(true);
    axios.post(
      SERVER_URL + "/files",
      {
        master: localStorage.getItem("wallet"),
        badgeAddress: badgeAddressForSelectedDao,
        sortOption: sort_option
      }
    ).then((response) => {
      setLoading(false);
      if (response.data.error) {
        orAlert("Failed to load ONERep files: " + response.data.data);
        return;
      }
      setRepFiles(refineTableData(response.data.data));
    });
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
    }).then((response) => {
      inform("Success", response.data.message, "success");
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
    }).then((files) => {
      // this.setState({
      // fileInfos: files.data,
      // });
    }).catch((err) => {
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
  const handleDropDown = async (selectedDaoName = 'All') => {
    try {
      let getDaoDataReqParam = {
        master: localStorage.getItem("wallet"),
        dao: selectedDaoName === "All" ? null : selectedDaoName
      };
      // let isAdmin = localStorage.getItem("isAdmin");
      // if (isAdmin) {
      //   getDaoDataReqParam = {
      //     master: localStorage.getItem("wallet"),
      //   };
      // }
      if (selectedDaoName !== 'All') {
        let resp = await axios.post(SERVER_URL + "/getDaoData", getDaoDataReqParam);
        if (resp.data.success) {
          let selectedDao = resp.data.data ? resp.data.data.length ? resp.data.data[0] : null : null;
          if (selectedDao) {
            setSelectedDao(selectedDao);
            setSelectedDaoTokenTotalSupply(selectedDao.sent);
            loadOneRepFiles(selectedDao.badgeAddress);
          }
        } else {
          orAlert("Failed to get DAO list: " + resp.data.data);
          return;
        }
      } else {
        setSelectedDao(null);
        setSelectedDaoTokenTotalSupply(0);
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
          isFileImportable ?
            <div className="zl_all_page_notify_logout_btn">
              <ul className="v-link">
                <li>
                  <button onClick={handleTriggerFileImportWizard} className="btn-connect">
                    Add ONERep File
                  </button>
                </li>
              </ul>
            </div> :
            <></>
        }
      </div>
      {
        showMintWizard ?
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
          /> :
          <></>
      }
      <div className='main-text-color'>
        <div className='flow-layout mr-20'>
          <div className='flow-layout mr-10'>DAO</div>
          <div className='flow-layout mr-10'>
            <Dropdown onSelect={handleDropDown}>
              <Dropdown.Toggle variant="dropdown" id="dropdown-basic">
                {selectedDao ? selectedDao.name ? selectedDao.name : "All" : "All"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {
                  (daoList.length > 0) ?
                    daoList.map(m => {
                      return <Dropdown.Item key={m.name} eventKey={m.name}>{m.name}</Dropdown.Item>
                    }) :
                    <Dropdown.Item eventKey={daoList.name}>{daoList.name}</Dropdown.Item>
                }
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        {
          selectedDao ? ([
            <div key="badge-token-name-label" className='flow-layout mr-20'>
              Token Name
              <label className="bordered-label">
                {selectedDao ? selectedDao.badge ? selectedDao.badge : " " : " "}
              </label>
            </div>,
            <div key="badge-token-total-supply-label" className='flow-layout mr-10'>
              Number Of Tokens
              <label className="bordered-label">
                {selectedDaoTokenTotalSupply}
              </label>
            </div>
          ]) :
            <></>
        }
      </div>
      <br />
      <OrTable
        name="file-table"
        columns={fileTableHeaderInfo}
        editable={false}
        removable={false}
        rows={repfiles}
      />
      {/******************* "Minted Successfully" Dialog *********************/}
      <BasicModal show={showMessageBox} title={messageBoxTitle} modalType={messageBoxType} closeModal={handleCloseMessageBox}>
        <p className="main-text-color text-center">
          {messageBoxContent}
        </p>
      </BasicModal>
      {/******************* "Minted Failure" Dialog *********************/}
      <Modal centered show={showFailure} onHide={handleCloseFailure}>
        <Modal.Body>
          <div className="p-4">
            <br />
            <h4 className="text-center text-white">
              Failed to Mint
            </h4>
            <br />
            <div className="main-text-color text-center modal-msg-body-layout">
              {mintFailureReason}
            </div>
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
