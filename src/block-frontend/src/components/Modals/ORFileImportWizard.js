import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  CardFooter
} from "reactstrap";
import Modal from "react-bootstrap/Modal";

import ORFiwStep1 from "./ORFiwStep1";
import ORFiwStep2 from "./ORFiwStep2";
import ORFiwStep3 from "./ORFiwStep3";

import ORFileImportWizardSPB from "./ORFileImportWizardSPB";

const ORFileImportWizard = props => {

  const { stepActions, stepData, onClose } = props;

  const [currentStep, setCurrentStep] = useState(1);
  const [failedPass, setFailedPass] = useState(false);
  const [fileToUpload, setFileToUpload] = useState("");
  const [passedStep, setPassedStep] = useState(0);
  const [_stepData, setStepData] = useState([]);

  useEffect(() => {
    setStepData(stepData);
  }, [stepData]);

  // Use the submitted data to set the state
  const handleChange = event => {
    const { name, value } = event.target;
    if (name === 'currentStep') setCurrentStep(value);
    else if (name === 'fileToUpload') setFileToUpload(value);
    else if (name === 'passedStep') setPassedStep(value);
  }
  // Trigger an alert on form submission
  const checkAccomplished = step => {
    setPassedStep(step);
  }
  const validateStep = step => {
    if (step === 1) {
      if (passedStep >= 1) {
        return true;
      }
      return false;
    } 
    return true;
  }
  // Test current step with ternary
  // _next and _previous functions will be called on button click
  const _next = () => {
    if (!validateStep(currentStep)) {
      setFailedPass(true);
      setTimeout(() => { setFailedPass(false) }, 700);
      return;
    }
    setFailedPass(false);
    // If the current step is 1 or 2, then add one on "next" button click
    let _currentStep = currentStep >= 2 ? 3 : currentStep + 1;
    setCurrentStep(_currentStep);
  }
  const _prev = () => {
    if (currentStep === 2) {
      setPassedStep(0);
    }
    // If the current step is 2 or 3, then subtract one on "previous" button click
    let _currentStep = currentStep <= 1 ? 1 : currentStep - 1;
    setCurrentStep(_currentStep);
  }
  const _mint = ev => {
    stepActions[stepActions.length - 1](ev);
  }
  // The "next" and "previous" button functions
  const PreviousButton = () => {
    // If the current step is not 1, then render the "previous" button
    if (currentStep !== 1) {
      return (
        <Button color="secondary float-left" onClick={_prev}>
          Previous
        </Button>
      );
    }
    // ...else return nothing
    return <></>;
  }
  const NextButton = () => {
    // If the current step is not 3, then render the "next" button
    if (currentStep < 3) {
      return (
        <div className="or-button float-right" onClick={_next}>
          Next
        </div>
      );
    }
    // ...else render nothing
    return <></>;
  }
  const MintButton = () => {
    // If the current step is the last step, then render the "submit" button
    if (currentStep > 2) {
      return <div className="or-button float-right" onClick={_mint}>Mint</div>;
    }
    // ...else render nothing
    return <></>;
  }

  return (
    <>
      {/*<Modal centered className="w-fit-content" show={show} onHide={handleCloseWatingModalForMint}>*/}
      <Modal centered className="or-wizard-modal w-fit-content" show={true}>
        <Modal.Body className="">
          <Card className="or-wizard-dialog bg-dark main-text-color">
            <CardHeader>
                <div className="flow-layout float-left mr-10">
                  Import Cordinape file
                </div>
                <div className="or-small-button float-right" onClick={onClose}>x</div>
            </CardHeader>
            <CardBody>
              <CardTitle style={{"marginBottom": "4em", "marginTop": "2em"}}>
                <ORFileImportWizardSPB currentStep={currentStep} failedPass={failedPass} stepCount={3} />
              </CardTitle>
              <CardText />
              <ORFiwStep1
                currentStep={currentStep}
                handleChange={handleChange}
                fileToupload={fileToUpload}
                checkAccomplished={checkAccomplished}
                stepAction={stepActions[0]}
                stepData={_stepData[0]}
              />
              <ORFiwStep2
                currentStep={currentStep}
                handleChange={handleChange}
                checkAccomplished={checkAccomplished}
                stepAction={stepActions[1]}
                stepData={_stepData[1]}
              />
              <ORFiwStep3
                currentStep={currentStep}
                handleChange={handleChange}
                checkAccomplished={checkAccomplished}
                stepAction={stepActions[2]}
                stepData={_stepData[2]}
              />
            </CardBody>
            <CardFooter>
              <PreviousButton />
              <NextButton />
              <MintButton />
            </CardFooter>
          </Card>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ORFileImportWizard;
