import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { USERS } from "../store/actionTypes";
import Web3 from "web3";
import { initContractByChainId } from "../service/contractService";
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
  const [daodata,setDaoData] = useState([]);
  const [selectedDaoName, setSelectedDaoName] = useState(null);
  const [selectedDaoTokenTotalSupply, setSelectedDaoTokenTotalSupply] = useState(0);

  const dispatch = useDispatch();
  let badgeTokenAddress = null;
  let chainId = null;

  useEffect(() => {
    console.log("Dao Data",daodata)
  }, [daodata])
  useEffect(() => {
    console.log("BoardData",boardData)
  }, [boardData])
  useEffect(()=>{
     console.log("selected Value",selectedV)
  }, [selectedV])
  useEffect(() => {
    dispatch({
      type: USERS.CONNECT_WALLET, 
      payload: { 
        wallet: localStorage.getItem('wallet'),
        user: localStorage.getItem('username'),
      }
    });
    
    badgeTokenAddress = localStorage.getItem('badgeTokenAddress');
    chainId = localStorage.getItem('chainId');

    axios.post(SERVER_URL + "/getDaoData", {
      master: localStorage.getItem("wallet")
    }).then((resp)=> {
      if (resp.data.error !== undefined && resp.data.error === 0) {
        let daos = resp.data.data;
        setDaoData(daos);
        // if (daos.length === undefined && daos.dao !== undefined && daos.dao !== null) {
        //   setSelectedDaoName(daos.dao);
        //   getOneRepBoard(daos.dao);
        //   // Get total count of token for the DAO
        //   axios.post(SERVER_URL + "/getOneRepBoard", {
        //     parent: resp.data.parent,
        //     master: resp.data.wallet,
        //     sort: sortOption,
        //   })
        //   .then((response) => {
        //     let totalTokens = 0;
        //     response.data.users.map(u => {
        //       totalTokens += parseInt(u.sum);
        //     });
        //     setSelectedDaoTokenTotalSupply(totalTokens);
        //   });
        // } else if (daos.length !== undefined && daos.length > 0) {
        //   setDaoData(daos);
        // }
      } else {
        alert("Failed to get DAO data");
      }
    });
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
  const getOneRepBoard = (value) => {
    axios.post(SERVER_URL + "/getOneRepBoard", {
      master: localStorage.getItem('wallet'),
      dao: value,
      sortOption: "{\"dao\": \"ASC\"}",
    })
    .then((response) => {
      console.log("Response from backend",response)
      setBoardData(response.data.users)   
    })
    .catch(error => {
      console.log("Failed to getOneRepBoard(): ", error);
    });
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
  const handleDropDown = (e) => {
    console.log("Handle Drop Down",e)
    setSelectedDaoName(e);
    axios.post(SERVER_URL + "/getDaoData", {
      master: localStorage.getItem("wallet"),
      dao: e
    }).then((resp)=> {
      let daos = resp.data;
      setDaoData(resp.data);
    });
    getOneRepBoard(e);
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
      <div className='main-text-color'>
        <div className='flow-layout'>
          <div className='flow-layout'>DAO</div>
          <div className='flow-layout'>
            <Dropdown onSelect={handleDropDown}>
              <Dropdown.Toggle variant="dropdown" id="dropdown-basic">
                {selectedDaoName ? selectedDaoName: "Select DAO"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
              {
                (daodata.length >1) ? 
                  daodata.map(m => {
                    return <Dropdown.Item eventKey={m.dao}>{m.dao}</Dropdown.Item>          
                  }): 
                  <Dropdown.Item eventKey={daodata.dao}>{daodata.dao}</Dropdown.Item>  
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
            {daodata.badge}
          </label>
        </div>
        <div className='flow-layout'>
          Number of Tokens 
          <label className="bordered-label">
            {selectedDaoTokenTotalSupply}
          </label>
        </div>
      </div>
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
                Wallet Id
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
