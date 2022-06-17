import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { connect } from 'react-redux';

const BadgeTokenAddressBox = props => {

	const { badgeTokenAddress } = props;

	let history = useHistory();

	const [_badgeTokenAddress, setBadgeTokenAddress] = useState(null);
	const [showCopiedMessage, setShowCopiedMessage] = useState(false);

	useEffect(() => {
		if (badgeTokenAddress !== undefined && badgeTokenAddress !== null && badgeTokenAddress !== "") {
			setBadgeTokenAddress(badgeTokenAddress);
		}
	}, [badgeTokenAddress]);
	const onClick = async ev => {
		const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
		const permissionStatus = await navigator.permissions.query(queryOpts);
		// Will be 'granted', 'denied' or 'prompt':
		console.log(permissionStatus.state);

		// Listen for changes to the permission state
		permissionStatus.onchange = () => {
		  console.log(permissionStatus.state);
		};
		if (navigator.clipboard) {
			navigator.clipboard.writeText(_badgeTokenAddress).then(function() {
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
				<div className="badge-address-box w-full text-right">
				{
					_badgeTokenAddress && history.location.pathname !== "/" ? 
					<div title="Badge Token Address">
						<div className="flow-layout main-text-color mr-1"><img src='/assets/image/badge-token.png' alt="ONERep Token" width='26px' height='26px'/></div>
						<div className="flow-layout wallet-address main-text-color" onClick={onClick}>
							{
								_badgeTokenAddress.substring(0, 6) + 
								"..." + 
								_badgeTokenAddress.substring(_badgeTokenAddress.length-5, _badgeTokenAddress.length-1)
							}
						</div>
						{/******************* "Minting..." Dialog *********************/}
						<div className={`${showCopiedMessage?"show-toast-box ml-40":"hide-toast-box"}`} onClick={hideCopiedMessage}>
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
		badgeTokenAddress: state.userAction.badgeTokenAddress
	};
}

export default connect(mapStoreToProps)(BadgeTokenAddressBox)