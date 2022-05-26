import React, { useEffect, useState } from "react";
import "./ORFileImportWizardSPB.css";
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";

const StepLabel = (props) => {
  const [accomplished, setAccomplished] = useState(false);
  const [failedPass, setCheckPass] = useState(false);
  const [index, setIndex] = useState(0);
  const [_class, setClass] = useState("");

  useEffect(() => {
    setAccomplished(props.accomplished);
    setIndex(props.index);
    setCheckPass(props.failedPass);

    let _className = "indexedStep ";
    if (props.failedPass !== undefined && props.failedPass) {
      _className += "failed ";
    } else if (props.accomplished) {
      _className += "accomplished ";
    }
    setClass(_className);
  });

  return (
    <div className={_class}>{index + 1}</div>
  );
}
/*
 *********************************************************
 * Step progress bar in wizard for importing OpenRep File 
 *********************************************************
 */
const ORFileImportWizardSPB = props => {

  const [_failedPass, setCheckPass] = useState(true);
  const [_stepCount, setStepCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setCurrentStep(props.currentStep);
    setCheckPass(props.failedPass);
    setStepCount(props.stepCount);
  });

  var stepPercentage = 0;
  var failedPassList = [];

  for (let i = 0; i < props.stepCount; i++) {
    if (i == props.currentStep - 1) {
      failedPassList.push(props.failedPass);
    } else {
      failedPassList.push(false);
    }
  }

  if (props.currentStep === 1) {
    stepPercentage = 0;
  } else if (props.currentStep === 2) {
    stepPercentage = 50;
  } else if (props.currentStep === 3) {
    stepPercentage = 100;
  } else {
    stepPercentage = 0;
  }

  return (
    <ProgressBar percent={stepPercentage}>
      <Step>
        {({ accomplished, index }) => (
          <StepLabel accomplished={accomplished} index={index} failedPass={failedPassList[index]} />
        )}
      </Step>
      <Step>
        {({ accomplished, index }) => (
          <StepLabel accomplished={accomplished} index={index} failedPass={failedPassList[index]} />
        )}
      </Step>
      <Step>
        {({ accomplished, index }) => (
          <StepLabel accomplished={accomplished} index={index} failedPass={failedPassList[index]} />
        )}
      </Step>
    </ProgressBar>
  );
};

export default ORFileImportWizardSPB;
