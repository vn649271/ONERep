import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { connect } from 'react-redux';
import Modal from "react-bootstrap/Modal";

const WalletAddressBox = props => {

	const { wallet, userName } = props;

	let history = useHistory();

	const [_wallet_address, setWalletAddress] = useState(null);
	const [_user_name, setUserName] = useState(null);
	const [showCopiedMessage, setShowCopiedMessage] = useState(false);

	useEffect(() => {
		if (userName !== undefined && userName !== null && userName !== "") {
			setWalletAddress(wallet);
			setUserName(userName);			
		}
	});
	const onClick = ev => {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(_wallet_address).then(function() {
				console.log('Async: Copying to clipboard was successful!');
				setShowCopiedMessage(true);
				setTimeout(hideCopiedMessage, 700);
			}, function(err) {
				console.error('Async: Failed to copy text into clipboard: ', err);
			});			
		} else {
			console.error('Async: Could not copy text into clipboard');
		}
		console.log(history.location);
	}
	const hideCopiedMessage = () => setShowCopiedMessage(false);

	return  (
		<>
			<div className="text-right">
				<div className="wallet-address-box w-full">
				{
					_wallet_address && history.location.pathname !== "/" ? 
					<div>
						<div className="wallet-address" onClick={onClick} tooltip="Copy to clipboard">
						{
							_user_name + ": " + _wallet_address.substring(0, 6) + 
							"..." + 
							_wallet_address.substring(_wallet_address.length-5, _wallet_address.length-1)
						}
						</div>
						{/******************* "Minting..." Dialog *********************/}
						<div className={`${showCopiedMessage?"show-toast-box":"hide-toast-box"}`} onClick={hideCopiedMessage}>
							<div className="check-icon flow-layout">
						    	<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="flow-layout">Copied!</div>
						</div>
					</div>:
					<></>
				}
		        </div>
	        </div>
        </>
	)
}

function mapStoreToProps(state) {
	return { 
		userName: state.userAction.user,
		wallet: state.userAction.wallet
	};
}

export default connect(mapStoreToProps)(WalletAddressBox)