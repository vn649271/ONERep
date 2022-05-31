import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const BasicModal = props => {

	const { modalType, title, show, children, closeModal } = props;

	const [show_modal, setShowModal] = useState(false);
	const [modal_type, setModalType] = useState("");

	useEffect(() => {
		setShowModal(show);
		setModalType(modalType);
	});

  	const _closeModal = () => {
  		setShowModal(false);
  		closeModal();
  	};

    return (
	    <Modal centered show={show_modal} onHide={_closeModal} className="or-modal">
	        <Modal.Header closeButton>
	          <Modal.Title><span className={modalType}>{title}</span></Modal.Title>
	        </Modal.Header>
	        <Modal.Body>
	            {children}
	        </Modal.Body>
	        <Modal.Footer>
	          <Button variant="secondary" onClick={_closeModal}>
	            Close
	          </Button>
	        </Modal.Footer>
	    </Modal>
    );	
}

export default BasicModal;