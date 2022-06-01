import React, { useEffect } from 'react';

export default function OrSpinButton(props) {

    // renderMode: 'flex' - flex mode(caption is next by spinner) , 
    //             'overlapped' - overlapped mode(spinner is overlapped above the caption)
    const { title, onClick, additionalClass, size, extraData, children, renderMode='flex', disabled } = props;

    const baseClass = "justify-content-center align-items-center or-spin-button mx-auto focus:outline-none " +
                    (additionalClass ? additionalClass : "");
    const defaultClass = baseClass + " cursor-pointer";
    const disabledClass = baseClass + " or-spin-button-disabled";

    const [buttonClass, setButtonClass] = React.useState(defaultClass);
    const [status, setStatus] = React.useState(0); // 0: Normal, 1: Pending

    useEffect(() => {
        if (disabled !== undefined && disabled) {
            setButtonClass(disabledClass);
        } else {
            setButtonClass(status? disabledClass: defaultClass);
        }
    });
    // const handleMouseEvent = ev => {
    //     console.log(ev.type);
    // }
    const handleClick = ev => {
        if (disabled === undefined || !disabled) {
            _handleClick();
        }
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
