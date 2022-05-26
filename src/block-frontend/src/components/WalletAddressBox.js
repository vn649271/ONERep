import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { connect } from 'react-redux';

const WalletAddressBox = props => {

	const { wallet, userName } = props;

	let history = useHistory();

	const [_wallet_address, setWalletAddress] = useState(null);
	const [_user_name, setUserName] = useState(null);

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
			}, function(err) {
				console.error('Async: Failed to copy text into clipboard: ', err);
			});			
		} else {
			console.error('Async: Could not copy text into clipboard');
		}
		console.log(history.location);
	}

	return  (
		<div className="w-full">
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
			</div>:
			<></>
		}
        </div>
	)
}

function mapStoreToProps(state) {
	return { 
		userName: state.userAction.user,
		wallet: state.userAction.wallet
	};
}

export default connect(mapStoreToProps)(WalletAddressBox)