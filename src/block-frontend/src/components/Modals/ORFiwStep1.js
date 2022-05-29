import React from "react";

/*
 ***********************************
 * ONERep File Import Wizard Step1
 ***********************************
 */
const ORFiwStep1 = props => {
  
  const {checkAccomplished, stepAction} = props;

  if (props.currentStep !== 1) {
    return null;
  }

  const handleStepAction = (ev) => {
    console.log("ORFiwStep1.handleStepAction(): ", ev.target.files);
    if (ev.target && ev.target.files && ev.target.files.length) {
      checkAccomplished(1);
    }
    if (stepAction) {
      stepAction(ev);
    }
  }

  return (
    <>
      <p>Upload Cordinape File</p>
      <input 
        name="fileToUpload" 
        className="main-text-color"
        type="file" 
        accept=".csv"
        onChange={handleStepAction}
      />
    </>
  );
};

export default ORFiwStep1;