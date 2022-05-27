import React, { Component, useStyles } from 'react';
import OrSpinner from './OrSpinner';

var me;

export default function OrSpinButton(props) {

    // renderMode: 'flex' - flex mode(caption is next by spinner) , 
    //             'overlapped' - overlapped mode(spinner is overlapped above the caption)
    const { title, onClick, additionalClass, size, extraData, children, renderMode='flex' } = props;

    const baseClass = "justify-content-center align-items-center or-spin-button mx-auto focus:outline-none " +
                    (additionalClass ? additionalClass : "");
    const defaultClass = baseClass + " cursor-pointer";
    const disabledClass = baseClass + " spin-button-disabled";

    const [buttonClass, setButtonClass] = React.useState(defaultClass);
    const [status, setStatus] = React.useState(0); // 0: Normal, 1: Pending

    // const handleMouseEvent = ev => {
    //     console.log(ev.type);
    // }
    const handleClick = ev => {
        console.log("handleClick()");
        _handleClick();
    };
    const _handleClick = () => {
        if (status) {
            return;
        }
        setStatus(1);
        setButtonClass(disabledClass);
        onClick({
            stopWait: stopWait, 
            getExtraData: getExtraData
        });
    };
    const stopWait = () => {
        setButtonClass(defaultClass);
        setStatus(0);        
    }
    const getExtraData = () => {
        return extraData;
    }

    return (
        <div
            id={props.id} 
            className={buttonClass} 
            onClick={handleClick}
            // onMouseDown={handleMouseEvent}
            // onMouseUp={handleMouseEvent}
        >
            {status?
                <div className={`${renderMode} items-center justify-center mr-2`}>
                  <div className={`or-spin-border spinner-border ${size}`} role="status"/>
                </div>:
            <></>}
            {children}
        </div>
    );
}
