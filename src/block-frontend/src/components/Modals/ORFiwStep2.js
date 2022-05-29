import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";

/*
 ***********************************
 * ONERep File Import Wizard Step 2
 ***********************************
 */
const ORFiwStep2 = props => {

  const {/*checkAccomplished, stepAction,*/ stepData} = props;

  const [tableRows, setTableRows] = useState([]);
  const [values, setValues] = useState([]);
  const [reputation, setReputation] = useState(0);

  useEffect(() => {
    if (stepData) {
      if (stepData.tableRows && stepData.tableRows.length && stepData.tableRows.length > 0) {
        setTableRows(stepData.tableRows);
      }
      if (stepData.values && stepData.values.length && stepData.values.length > 0) {
        setValues(stepData.values);
      }
      if (stepData.reputation) {
        setReputation(stepData.reputation);
      }
    }
  }, [stepData]);
  
  if (props.currentStep !== 2) {
    return null;
  }

  // const handleStepAction = (ev) => {
  //   checkAccomplished(2);
  //   if (stepAction) {
  //     stepAction(ev);
  //   }
  // }

  return (
    <>
      <p>Verify the records</p>
      <Table responsive striped className="zl_transaction_list_table table">
        <thead>
          <tr>
            {
              tableRows && tableRows.length?
                tableRows.map((rows, index) => {
                  return <th key={index}>{rows}</th>;
                }):
              <></>
            }
          </tr>
        </thead>
        <tbody>
          {
            values && values.length?
              values.map((value, index) => {
                return (
                  <tr key={index}>
                    {value.map((val, i) => {
                      return <td key={i}>{val}</td>;
                    })}
                  </tr>
                );
              }):
              <tr></tr>
          }
        </tbody>
      </Table>
      <br />
      <div className="text-right text-white">
        <h6>Total Mint: {reputation}</h6>
      </div>
    </>
  );
};

export default ORFiwStep2;