import React, { useState, useEffect } from "react";
import "react-step-progress/dist/index.css";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { USERS } from "../store/actionTypes";
import { orAlert } from "../service/utils";
import Table from "react-bootstrap/Table";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import OrSpinner from "../components/OrSpinner";
import OrTable from "../components/OrTable";
const { SERVER_URL } = require("../conf");

/*
 ***************************************
 ********* ONERep Board page  **********
 *************************************** 
 */
 const OneRepBoardModule = (props) => {
  const [show, setShow] = useState(false);
  const [boardData, setBoardData] = useState([]);
  const [sort_dao, setSortDao] = useState(1);
  const [sort_name, setSortName] = useState(1);
  const [sort_badge, setSortBadge] = useState(1);
  const [sort_id, setSortId] = useState(1);
  const [sort_sum, setSortSum] = useState(1);
  const [sort_wallet, setSortWallet] = useState(1);
  const [sortOption, setSortOption] = useState({ sum: -1 });
  const [daoList, setDaoList] = useState([]);
  const [selectedDao, setSelectedDao] = useState(null);
  const [selectedDaoTokenTotalSupply, setSelectedDaoTokenTotalSupply] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [badgeTokenAddress, setBadgeTokenAddress] = useState(null);
  const [userName, setUserName] = useState(null);
  const [inited, setInited] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [chainId, setChainId] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    // Init connection info
    if (!inited) {
      axios.post(
        SERVER_URL + '/users/loggedinuserbywallet',
        {
          wallet: localStorage.getItem("wallet")
        }
      ).then(ret => {
        let userInfo = ret.data ? ret.data.data ? ret.data.data : null : null;
        if (!userInfo) {
          orAlert("Failed to get information for current logined user");
          return;
        }
        setInited(true);
        setIsAdmin(userInfo.userType === 0);
        localStorage.setItem("isAdmin", userInfo.userType === 0);
        let badgeTokenAddress = userInfo.daoRelation ?
          userInfo.daoRelation.length ?
            userInfo.daoRelation[0].badgeAddress :
            null :
          null;
        setBadgeTokenAddress(badgeTokenAddress);
        setUserName(userInfo.username);
        // setChainId(localStorage.getItem('chainId'));
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
                  name: 'All'
                },
                ...daos
              ];
            }
            setDaoList(daos);
            // if (daos.length && daos.length > 1) { // 
            if (userInfo.userType === 1 && daos.length) { // System User
              handleDropDown(daos[0].name);
            } else {
              handleDropDown('All');
            }
          } else {
            alert("Failed to get DAO data");
          }
        });
      }).catch(error => {
        orAlert("OneRepBoard: Failed to get information for logged in user: " + error.message);
      });
    }
  });

  useEffect(() => {
    if (
      localStorage.getItem("wallet") === "" ||
      !localStorage.getItem("wallet")
    ) {
      window.location.href = "/";
      return;
    }
  }, [show, sortOption]);

  useEffect(() => {
    setSortOption({dao: sort_dao});
  }, [sort_dao]);

  useEffect(() => {
    setSortOption({name: sort_name});
  }, [sort_name]);

  useEffect(() => {
    setSortOption({badge: sort_badge});
  }, [sort_badge]);

  useEffect(() => {
    setSortOption({_id: sort_wallet});
  }, [sort_wallet]);

  useEffect(() => {
    setSortOption({sum: sort_sum});
  }, [sort_sum]);

  useEffect(() => {
    loadBoardData(
      selectedDao ?
        selectedDao.badgeAddress ?
          selectedDao.badgeAddress :
          null :
        null
    );
  }, [sortOption]);

  const loadBoardData = async (badgeAddress) => {
    try {
      setLoading(true);
      let ret = await axios.post(SERVER_URL + "/getOneRepBoard", {
        master: localStorage.getItem('wallet'),
        sort: sortOption,
        badgeAddress: badgeAddress
      });
      setLoading(false);
      if (ret === null || ret.data === undefined || ret.data.success === undefined || !ret.data.success) {
        orAlert("Failed to get all board data for super admin");
        return;
      }
      setBoardData(refineTableData(ret.data.data));
    } catch (error) {
      orAlert("Failed to loadBoardData(): " + error.message);
    }
  };
  // const getSelOpList = () => {
  //   axios.post(SERVER_URL + "/getSelOpList", {
  //     master: localStorage.getItem("wallet"),
  //   })
  //   .then((response) => {
  //     console.log("The response in inside getSelOpList",response);
  //     setSelectData(response.data);
  //   });
  // };
  const onSortDao = ev => {
    setSortDao(-sort_dao);
    console.log(-sort_dao);
  }
  const onSortName = ev => {
    setSortName(-sort_name);
    console.log(-sort_name);
  }
  const onSortBadge = ev => {
    setSortBadge(-sort_badge);
    console.log(-sort_badge);
  }
  const onSortSum = ev => {
    setSortSum(-sort_sum);
    console.log(-sort_sum);
  }
  const onSortWallet = ev => {
    setSortWallet(-sort_wallet);
    console.log(-sort_wallet);
  }

  /*
   ******************************************
   * Data definition for ONERep Board Table 
   ****************************************** 
   */
  const boardDataTableHeaderInfo = [
    { label: "DAO", name: "dao", sortable: true, clickHandler: onSortDao },
    { label: "BADGE", name: "badge", sortable: true, clickHandler: onSortBadge },
    { label: "Name", name: "name", sortable: true, clickHandler: onSortName },
    { label: "Wallet", name: "wallet", className: "text-center", sortable: true, clickHandler: onSortWallet },
    { label: "ONEREP TOKENS", name: "sum", className: "text-right", sortable: true, clickHandler: onSortSum },
  ];
  const refineTableData = rawTableData => {
    let _boardDataList = [];
    for (let i in rawTableData) {
        let r = rawTableData[i];
        _boardDataList.push({
            "dao": { content: r.dao },
            "badge": { content: r.badge },
            "name": { content: r.name },
            "wallet": { className: "text-center", content: r._id },
            "sum": { className: "text-right", content: r.sum },
        });
    }
    return _boardDataList;
  }

  const handleDropDown = async (selectedDaoName = 'All') => {
    try {
      let getDaoDataReqParam = {
        master: localStorage.getItem("wallet"),
        dao: selectedDaoName === "All" ? null : selectedDaoName
      };
      if (selectedDaoName !== 'All') {
        let resp = await axios.post(SERVER_URL + "/getDaoData", getDaoDataReqParam);
        if (resp.data.success) {
          let selectedDao = resp.data.data ? resp.data.data.length ? resp.data.data[0] : null : null;
          if (selectedDao) {
            setSelectedDao(selectedDao);
            setSelectedDaoTokenTotalSupply(selectedDao.sent);
            loadBoardData(
              selectedDao ?
                selectedDao.badgeAddress ?
                  selectedDao.badgeAddress :
                  null :
                null
            );
          }
        } else {
          orAlert("Failed to get DAO list: " + resp.data.data);
          return;
        }
      } else {
        setSelectedDao(null);
        setSelectedDaoTokenTotalSupply(0);
        loadBoardData(null);
      }
    } catch (error) {
      console.log("Error occurred in handleDropDown()", error);
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
            <div key="token-name-label" className='flow-layout mr-20'>
              Token Name
              <label className="bordered-label">
                {selectedDao ? selectedDao.badge ? selectedDao.badge : " " : " "}
              </label>
            </div>,
            <div key="token-token-total-count-label" className='flow-layout mr-10'>
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
        name="board-data-table"
        columns={boardDataTableHeaderInfo}
        editable={false}
        removable={false}
        rows={boardData}
      />
    </section>
  );
};

const mapStoreToProps = ({ userAction }) => ({});
export default connect(mapStoreToProps, null)(OneRepBoardModule);
