import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import HeadingModule from '../components/Layout/HeadingComponent/Heading';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Chart from "react-apexcharts";
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { Link, Redirect } from 'react-router-dom';
import { CSVLink } from "react-csv";
import ReactTable from "react-table-6";  
import "react-table-6/react-table.css" 
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import UploadFiles from "../components/UploadFiles";

// import { mapStateToProps } from './mappers';

const columns = [
    {
      Header: "No",
      accessor: "No", // String-based value accessors!
    },
    {
      Header: "name",
      accessor: "name",
    },
    {
      Header: "Date",
      accessor: 'Date',
    },
    {
      Header: "address",
      accessor: "address",
    },
    {
      Header: "epoch number",
      accessor: "epoch number",
    },
    {
      Header: "received",
      accessor: "received",
    },
    {
      Header: "sent",
      accessor: "sent",
    },
  ];

const DashboardModule = (props) => {
  const reactTable = useRef(null)
  const csvLink = useRef(null)
  const [file, setFile] = useState();
  const [array, setArray] = useState([]);

  useEffect(() => {
    console.log('props.user', props.user)
    if (props.user && Object.keys(props.user).length === 0 && !localStorage.getItem('user')) {
        return (
          <Redirect to={'/'} />
        )
    }
  }, [props.user])

  const fileReader = new FileReader();

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const csvFileToArray = string => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map(i => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        let temp = header.split('').filter(c => c !== '"' && c !== '.').join('').trim()
        object[temp] = (values[index] || '').trim();
        return object;
      }, {});
      return obj;
    });
    console.log('[ar', array)

    setArray(array);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const text = event.target.result;
        csvFileToArray(text);
      };

      fileReader.readAsText(file);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <UploadFiles />
      
    </div>
  );
}
const mapStoreToProps = ({ userAction }) => ({
    user: userAction.user,
});
export default connect(mapStoreToProps, null)(DashboardModule);
