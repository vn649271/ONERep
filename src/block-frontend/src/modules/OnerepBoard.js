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
const { SERVER_URL } = require("../conf");

const OneRepBoardModule = (props) => {
  const [show, setShow] = useState(false);
  const [boardData, setBoardData] = useState([]);
  const [sort_name, setSortName] = useState(1);
  const [sort_badge, setSortBadge] = useState(1);
  const [sort_id, setSortId] = useState(1);
  const [sort_sum, setSortSum] = useState(1);
  const [sortOption, setSortOption] = useState({ badge: 1 });
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
                                userInfo.daoRelation[0].badgeAddress:
                                null:
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
            daos = [
              {
                _id: '',
                name: 'All'
              },
              ...daos
            ];
            setDaoList(daos);
            if (daos.length && daos.length > 1) { // 
              handleDropDown(null, daos);
            } else {
              handleDropDown(daos[0].name, daos);
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
    loadBoardData(
      selectedDao? 
        selectedDao.badgeAddress? 
          selectedDao.badgeAddress: 
        null: 
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
      if (ret === null || ret.data === undefined || ret.data.success === undefined || !ret.data.success) 
      {
        orAlert("Failed to get all board data for super admin");
        return;
      }
      setBoardData(ret.data.data);
    } catch (error) {
      orAlert("Failed to loadBoardData(): ", error.message);
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
  const handleDropDown = async (selectedDaoName, daos = null) => {
    try {
      let getDaoDataReqParam = {
        master: localStorage.getItem("wallet"),
        dao: selectedDaoName === "All" ? null : selectedDaoName
      };
      if (selectedDaoName !== 'All') {
        let resp = await axios.post(SERVER_URL + "/getDaoData", getDaoDataReqParam);
        if (resp.data.success) {
          let selectedDao = resp.data.data ? resp.data.data.length ? resp.data.data[0]: null : null;
          if (selectedDao) {
            setSelectedDao(selectedDao);
            setSelectedDaoTokenTotalSupply(selectedDao.sent);
            loadBoardData(
              selectedDao? 
                selectedDao.badgeAddress? 
                  selectedDao.badgeAddress: 
                null: 
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
      <div>
        <Table striped className="or-table">
          <thead>
            <tr>
              <th>DAO</th>
              <th 
                className="or-table-sortable-column"
                onClick={() => {
                  setSortBadge(-sort_badge);
                  setSortOption({ badge: -sort_badge });
                }}
              >Badge</th>
              <th
                className="or-table-sortable-column"
                onClick={() => {
                  setSortName(-sort_name);
                  setSortOption({ name: -sort_name });
                }}
              >
                Name
              </th>
              <th
                className="or-table-sortable-column"
                onClick={() => {
                  setSortId(-sort_id);
                  setSortOption({ _id: -sort_id });
                }}
              >
                Wallet
              </th>
              <th
                className="or-table-sortable-column text-right"
                onClick={() => {
                  setSortSum(-sort_sum);
                  setSortOption({ sum: -sort_sum });
                  loadBoardData(
                    selectedDao? 
                      selectedDao.badgeAddress? 
                        selectedDao.badgeAddress: 
                      null: 
                    null
                  );
                }}
              >
                ONERep Tokens
              </th>
            </tr>
          </thead>
          <tbody>
            {
              loading ?
                <tr>
                  <td colSpan="5" className="text-center main-text-color-second p-2"><OrSpinner size="medium" /></td>
                </tr> :
                <>
                  {
                    boardData && boardData.length > 0 ? boardData.map((row, i) => {
                      return (
                        <tr key={i}>
                          <td>{row.dao}</td>
                          <td>{row.badge}</td>
                          <td>{row.name}</td>
                          <td>{row._id}</td>
                          <td className="text-right">
                            {row.sum}
                          </td>
                        </tr>
                      );
                    }) : <tr><td colSpan="5" className="text-center main-text-color-second"><i>No Data</i></td></tr>
                  }
                </>
            }
          </tbody>
        </Table>
      </div>
    </section>
  );
};
const mapStoreToProps = ({ userAction }) => ({});
export default connect(mapStoreToProps, null)(OneRepBoardModule);
