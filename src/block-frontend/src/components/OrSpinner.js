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
	    <div className="flex items-center justify-center mr-2">
	      <div className={`or-spin-border spinner-border ${size}`} role="status"/>
	    </div>
	);
}

export default OrSpinner;