import React, { useState, useEffect } from 'react';
import classNames from "classnames";

const OrSpinner = props => {
	const {size, margin='mt-10 mb-10', color='gray'} = props;

	const [_size, setSize] = useState(size);
	const [_margin, setMargin] = useState(margin);

	useEffect(() => {
		setSize(size);
		setMargin(margin);
	});

	return (
	    <div className={classNames("or-spinner flex justify-center", `${_margin}`)}>
	        <div style={{'borderTopColor':'transparent'}}
	            className={
	            	classNames(
	            		`w-${_size} h-${_size}`, 
	            		"border-2", 
	            		`border-${color}-500`, 
	            		"border-solid rounded-full animate-spin"
	            	)
	            }
	        />
	    </div>
	);
}

export default OrSpinner;