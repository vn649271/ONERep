import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { FaPencilAlt, FaUserAlt, FaTrashAlt, FaRegSave } from "react-icons/fa";

const OrTable = props => {
    
    const {columns, rows, methods} = props;

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [startRowIndex, setStartRowIndex] = useState(0);
    const [totalRows, setTotalRows] = useState(0);

    useEffect(() => {
        setTotalRows(getTotalRows(rows));
    }, [rows]);

    useEffect(() => {
        buildTable();
    }, [startRowIndex]);
    useEffect(() => {
        setStartRowIndex(0);
        setPageNumber(1);
    }, [pageSize]);

    const onPageChanged = ev => {
        let _page = ev.target.value;
        setPageNumber(_page);
        setStartRowIndex(pageNumber * pageSize);
        console.log(_page);
    }
    const onPrevPage = ev => {
        let _page = pageNumber - 1;
        if (_page < 1) _page = 1;
        setPageNumber(_page);
        setStartRowIndex((_page - 1) * pageSize);
    }
    const onNextPage = ev => {
        let _page = pageNumber + 1;
        let nextAvailablePageNumber = parseInt((totalRows / pageSize) + 1);
        if (totalRows % pageSize === 0) {
            nextAvailablePageNumber--;
        }
        if (_page > nextAvailablePageNumber) {
            _page = pageNumber;
        }
        setPageNumber(_page);
        setStartRowIndex((_page - 1) * pageSize);
    }
    const onPageSizeChanged = ev => {
        let _pageSize = ev.target.value;
        if (_pageSize < 0) {
            _pageSize = 0;
        }
        setPageSize(_pageSize);
    }
    const getTotalRows = _rows => {
        let trCount = 0;
        if (_rows.length) {
            for (let i in _rows) {
                let row = _rows[i];
                if (row.daos && row.daos.length) {
                    for (let j in row.daos) {
                        trCount++;
                    }
                } else {
                    trCount++;
                }
            }
        }
        return trCount;
    }
    const buildTable = () => {
        let trArray = [];
        let trCount = 0;
        if (rows.length) {
            for (let i in rows) {
                let row = rows[i];
                if (row.daos && row.daos.length) {
                    for (let j in row.daos) {
                        if (trCount < startRowIndex) {
                            trCount++;
                            continue;
                        }
                        if (trCount - startRowIndex >= pageSize) {
                            break;
                        }
                        let dao = row.daos[j];
                        trArray.push(
                            <tr key={i + "-" + j}>
                                <td><FaUserAlt /><span className="pl-2">{row.username}</span></td>
                                <td>{dao ? dao ? dao.name : null : null}</td>
                                <td>{row.wallet}</td>
                                <td className="text-center">{row.userType === 0 ? 'Admin' : '-'}</td>
                                <td className="text-right">{dao.received}</td>
                                <td className="text-center">{!row.status ? 'Inactive' : 'Active'}</td>
                                <td className="text-center">
                                    <div className="cursor-pointer flow-layout">
                                        <FaPencilAlt onClick={() => methods.onEditRow(row)} />
                                    </div>
                                    <div className="cursor-pointer flow-layout ml-20">
                                        <FaTrashAlt onClick={() => methods.onDeleteRow(row)} className="text-danger" />
                                    </div>
                                </td>
                            </tr>
                        );
                        trCount++;
                    }
                } else {
                    if (trCount < startRowIndex) {
                        trCount++;
                        continue;
                    }
                    if (trCount - startRowIndex >= pageSize) {
                        break;
                    }
                    trArray.push(
                        <tr key={i}>
                            <td><FaUserAlt /><span className="pl-2">{row.username}</span></td>
                            <td></td>
                            <td>{row.wallet}</td>
                            <td className="text-center">{row.userType === 0 ? 'Admin' : '-'}</td>
                            <td className="text-right">{row.received}</td>
                            <td className="text-center">{!row.status ? 'Inactive' : 'Active'}</td>
                            <td className="text-center">
                                <div className="cursor-pointer flow-layout">
                                    <FaPencilAlt onClick={() => methods.onEditRow(row)} />
                                </div>
                                <div className="cursor-pointer flow-layout ml-20">
                                    <FaTrashAlt onClick={() => methods.onDeleteRow(row)} className="text-danger" />
                                </div>
                            </td>
                        </tr>
                    );
                    trCount++;
                }
            }
        } else {
            trArray.push(<tr key="no-data"><td colSpan="7" className="text-center main-text-color-second"><i>No Data</i></td></tr>);
        }
        return trArray;
    }

    return (
        <div className="or-table-wrapper">
            <div className="or-table-content">
                <Table striped className="or-table table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>DAO</th>
                            <th>ETH Wallet</th>
                            <th>Are you admin?</th>
                            <th className="text-right">Reputation Awarded</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>{
                        buildTable()
                    }</tbody>
                </Table>
            </div>
            <div className="or-table-footer">
                <div className="page-sizer">
                    <input className="form-control" value={pageSize} onChange={onPageSizeChanged} />
                    <span className="ml-1 pt-2"> records per page</span>
                </div>
                <div className="paginator">
                    <div className="paginator-control">
                        <div className="main-button" onClick={onNextPage}>
                            <img src="assets/image/next.png" />
                        </div>
                    </div>
                    <div className="paginator-input">
                        <input className="form-control" value={pageNumber} onChange={onPageChanged} />
                    </div>
                    <div className="paginator-control">
                        <div className="main-button" onClick={onPrevPage}>
                            <img src="assets/image/prev.png" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrTable;