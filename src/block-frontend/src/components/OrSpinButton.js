import React, { Component, useStyles } from 'react';
import OrSpinner from './OrSpinner';

var me;

export default function OrSpinButton(props) {

    // renderMode: 0 - flex mode(caption is next by spinner) , 
    //             1 - overlapped mode(spinner is overlapped above the caption)
    const { title, additionalClass, extraData, children, renderMode=0 } = props;

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
        props.onClick({
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
                <div className="flex items-center justify-center mr-2">
                  <div className="or-spin-border spinner-border" role="status" />
                </div>:
            <></>}
            <label className="mb-0">{props.title}</label>
        </div>
    );
}
