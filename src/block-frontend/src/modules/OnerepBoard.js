import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { USERS } from "../store/actionTypes";
import Web3 from "web3";
import { initContractByChainId } from "../service/contractService";
import { orAlert } from "../service/utils";
import Table from "react-bootstrap/Table";
import Dropdown from "react-bootstrap/Dropdown";
import "react-step-progress/dist/index.css";
import axios from "axios";
const { SERVER_URL } = require("../conf");

const OneRepBoardModule = (props) => {
  const [show, setShow] = useState(false);
  const [selectData, setSelectData] = useState([]);
  const [boardData, setBoardData] = useState([]);
  const [selectedV, setSelectedV] = useState('');
  const [sort_name, setSortName] = useState(1);
  const [sort_id, setSortId] = useState(1);
  const [sort_sum, setSortSum] = useState(1);
  const [sortOption, setSortOption] = useState({ name: 1 });
  const [daoList,setDaoList] = useState([]);
  const [selectedDao, setSelectedDao] = useState(null);
  const [selectedDaoTokenTotalSupply, setSelectedDaoTokenTotalSupply] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [badgeTokenAddress, setBadgeTokenAddress] = useState(null);
  const [chainId, setChainId] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Dao Data",daoList);
  }, [daoList])
  useEffect(() => {
    console.log("BoardData",boardData)
  }, [boardData])
  useEffect(()=>{
     console.log("selected Value",selectedV)
  }, [selectedV])
  useEffect(() => {
    // Init connection info
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
      console.log("Logged in user:", ret.data);
      setIsAdmin(userInfo.isAdmin);
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
      let thisAddress = localStorage.getItem("wallet");
      if (!userInfo.isAdmin) {
        // Get all DAO names to fill into DAO name list and select first DAO from it
        axios.post(SERVER_URL + "/getDaoData", {
          master: thisAddress
        }).then((resp)=> {
          if (resp.data.error !== undefined && resp.data.error === 0) {
            let daos = resp.data.data;
            setDaoList(daos);
            handleDropDown(daos[0].dao);
          } else {
            alert("Failed to get DAO data");
          }
        });        
      } else {
        // For super admin, get all board data
        getOneRepBoard(thisAddress);
      }
    })    
  }, []);
  useEffect(() => {
    if (
      localStorage.getItem("wallet") == "" ||
      !localStorage.getItem("wallet")
    ) {
      window.location.href = "/";
      return;
    }
  }, [show, sortOption]);
  const getOneRepBoard = async (wallet) => {
    try {
      let ret = await axios.post(SERVER_URL + "/getOneRepBoard", {
        master: wallet,
        sort: sortOption,
      });
      if (ret === null || ret.data === undefined || 
        ret.data.data === undefined || ret.data.data.length === undefined) 
      {
        orAlert("Failed to get all board data for super admin");
        return;
      }
      setBoardData(ret.data.data);
    } catch(error) {
      orAlert("Failed to getOneRepBoard(): ", error.message);
    }
  };
  const getSelOpList = () => {
    axios.post(SERVER_URL + "/getSelOpList", {
      master: localStorage.getItem("wallet"),
    })
    .then((response) => {
      console.log("The response in inside getSelOpList",response);
      setSelectData(response.data);
    });
  };
  const handleDropDown = async (selectedDaoName) => {
    console.log("Handle Drop Down", selectedDaoName);
    try {
      let resp = await axios.post(SERVER_URL + "/getDaoData", {
        master: localStorage.getItem("wallet"),
        dao: selectedDaoName
      });
      let daos = resp.data.data;
      setSelectedDao(daos[0]);
      setSelectedDaoTokenTotalSupply(daos[0].sent);
      let ret = await getOneRepBoard(localStorage.getItem('wallet'));
      if (ret === null || ret.data === undefined || ret.data.length === undefined) {
        orAlert("Failed to get board data");
        return;
      }
      setBoardData(ret.data);
    } catch (error) {
      console.log("Error occurred in handleDropDown()", error);
    }
  };
  const handleInitContract = async () => {
    let web3 = new Web3(window.ethereum);
    try {
      initContractByChainId(web3, await web3.eth.net.getId());
    } catch (error) {
      alert(error);
    }
  };

  return (
    <section className="">
      <br />
      <br />
      <div className="zl_all_page_heading_section">
        <div className="zl_all_page_heading">
          <h2>ONERep Board</h2>
        </div>
        <div className="zl_all_page_notify_logout_btn"></div>
      </div>
      {
        !isAdmin ? 
          <div className='main-text-color'>
            <div className='flow-layout'>
              <div className='flow-layout'>DAO</div>
              <div className='flow-layout'>
                <Dropdown onSelect={handleDropDown}>
                  <Dropdown.Toggle variant="dropdown" id="dropdown-basic">
                    {selectedDao? selectedDao.dao ? selectedDao.dao: "Select DAO": "Select Dao"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                  {
                    (daoList.length > 0) ? 
                      daoList.map(m => {
                        return <Dropdown.Item key={m.dao} eventKey={m.dao}>{m.dao}</Dropdown.Item>          
                      }): 
                      <Dropdown.Item eventKey={daoList.dao}>{daoList.dao}</Dropdown.Item>  
                  }
                    {/* <Dropdown.Item onClick={handleDropDown}>Action</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item> */}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <div className='flow-layout'>
              Token Name
              <label className="bordered-label">
                {selectedDao ? selectedDao.badge ? selectedDao.badge: " ": " "}
              </label>
            </div>
            <div className='flow-layout'>
              Number of Tokens 
              <label className="bordered-label">
                {selectedDaoTokenTotalSupply}
              </label>
            </div>
          </div>:
        <></>
      }
      <br />
      <div>
        <Table striped className="or-table table">
          <thead>
            <tr>
              <th
                onClick={() => {
                  setSortName(-sort_name);
                  setSortOption({ name: -sort_name });
                }}
              >
                Name
              </th>
              <th
                onClick={() => {
                  setSortId(-sort_id);
                  setSortOption({ _id: -sort_id });
                }}
              >
                Wallet
              </th>
              <th
                className="text-right"
                onClick={() => {
                  setSortSum(-sort_sum);
                  setSortOption({ sum: -sort_sum });
                }}
              >
                ONERep Tokens
              </th>
            </tr>
          </thead>
          <tbody>
            {boardData.map((row, i) => {
              return (
                <tr key={i}>
                  <td>{row.name}</td>
                  <td>{row._id}</td>
                  <td className="text-right">
                    {row.sum}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </section>
  );
};
const mapStoreToProps = ({ userAction }) => ({});
export default connect(mapStoreToProps, null)(OneRepBoardModule);
