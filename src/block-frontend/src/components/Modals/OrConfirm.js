import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const OrConfirm = props => {

    const { show, children, closeConfirm, context } = props;

    const [show_modal, setShowModal] = useState(false);
    const [_context, setContext] = useState(null);

    useEffect(() => {
        setShowModal(show);
        setContext(context?context:null);
    });

    const _closeConfirmWithYes = () => {
        setShowModal(false);
        if (closeConfirm) {
            closeConfirm(true, _context);
        }
    };

    const _closeConfirmWithNo = () => {
        setShowModal(false);
        if (closeConfirm) {
            closeConfirm(false, null);
        }
    };

    return (
        <Modal centered show={show_modal} onHide={_closeConfirmWithNo} className="or-modal" onEscapeKeyDown={_closeConfirmWithNo}>
            <Modal.Header closeButton>
                <Modal.Title><span>Confirm</span></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
            <Modal.Footer>
                <Button style={{"marginRight": "15px"}} onClick={_closeConfirmWithYes}>
                    Yes
                </Button>
                <Button onClick={_closeConfirmWithNo}>
                    No
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default OrConfirm;