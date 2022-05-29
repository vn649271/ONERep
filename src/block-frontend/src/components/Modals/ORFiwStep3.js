import React from "react";

/*
 ***********************************
 * ONERep File Import Wizard Step 3
 ***********************************
 */
const ORFiwStep3 = props => {

  // const {checkAccomplished, stepAction} = props;

  if (props.currentStep !== 3) {
    return null;
  }

  // const handleStepAction = (ev) => {
  //   checkAccomplished(3);
  //   if (stepAction) {
  //     stepAction(ev);
  //   }
  // }

  return (
    <>
      <p>Mint</p>
    </>
  );
};

export default ORFiwStep3;