import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { FaPencilAlt, FaUserAlt, FaTrashAlt, FaRegSave } from "react-icons/fa";

const OrTable = props => {

    const {
        name,
        config,
        editable = false,
        removable = false,
        columns,
        rows,
        methods
    } = props;

    const [headers, setHeaders] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [startRowIndex, setStartRowIndex] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        buildTable();
        setTotalRows(rows.length ? rows.length : 0);
    }, [rows]);

    useEffect(() => {
        let _headers = [];
        if (columns && columns.length) {
            for (let c in columns) {
                _headers.push(
                    <th 
                        key={columns[c].name} 
                        className={
                            `${columns[c].className? columns[c].className : ""}` +
                            (columns[c].sortable ? " or-table-sortable-column" : "")
                        }
                        onClick={columns[c].clickHandler}
                    >
                        {columns[c].label}
                    </th>
                );
            }
            if (editable || removable) {
                _headers.push(<th key="actions">Actions</th>);
            }
        }
        setHeaders(_headers);
    }, [columns]);

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
    const buildTable = () => {
        let trArray = [];
        let trCount = 0;
        if (rows.length) {
            for (let i in rows) {
                let row = rows[i];
                if (trCount < startRowIndex) {
                    trCount++;
                    continue;
                }
                if (trCount - startRowIndex >= pageSize) {
                    break;
                }
                let fields = [];
                for (let j in columns) {
                    fields.push(
                        <td
                            key={name + "-" + i + "-" + j}
                            className={
                                `${row[columns[j].name].className ?
                                    row[columns[j].name].className :
                                    ""
                                }`
                            }
                        >{row[columns[j].name].content}
                        </td>
                    );
                }
                if (editable || removable) {
                    fields.push(
                        <td
                            key="row-actions-col"
                            className="text-center"
                        >
                            {
                                editable ? <div className="cursor-pointer flow-layout">
                                    <FaPencilAlt onClick={() => methods.onEditRow(row)} />
                                </div> : <></>}
                            {
                                removable ? <div className="cursor-pointer flow-layout ml-20">
                                    <FaTrashAlt onClick={() => methods.onDeleteRow(row)} className="text-danger" />
                                </div> : <></>
                            }
                        </td>
                    );
                }
                trArray.push(
                    <tr key={name + "-row-" + i}>{fields}</tr>
                );
                trCount++;
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
                        <tr>{headers}</tr>
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