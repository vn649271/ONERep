import React, { useState, useEffect } from "react";
import Settings from "../../modules/Settings";

import SideBar from "../SideBar";
import BasicModal from '../Modals/BasicModal';

// const GET_STARTED_DISALLOWED_ROUTES = [
//     "/account",
// ];

// const shouldGetStaredBeBlocked = path => GET_STARTED_DISALLOWED_ROUTES.some(item => path.startsWith(item));


const Layout = (props) => {

    const [color, setColor] = useState('zl_page_dark_mode');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageTitle, setMessageTitle] = useState(null);
    const [messageType, setMessageType] = useState('error');
    const [messageContent, setMessageContent] = useState(null);
   
    const url = window.location.pathname;
    const title = url.split('/')[1]

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setColor(localStorage.getItem("themColor"));
        }    
    });    

    const themHandler = (val) => {
        setColor(val ? 'zl_light_theme_active' : 'zl_page_dark_mode');
        if (typeof window !== 'undefined') {
            localStorage.setItem("themColor", val ? 'zl_light_theme_active' : 'zl_page_dark_mode');
        }    
    }    
    const handleCloseMessageBox = () => {
        setShowMessageBox(false);
    }    

    return (
        <div>
            <BasicModal
                show={showMessageBox}
                modalType={messageType}
                title={messageTitle}
                closeModal={handleCloseMessageBox}
            >
                {messageContent}
            </BasicModal>
            <div className={`zl_all_pages_content ${color === null ? 'zl_page_dark_mode' : color}`}>
                <SideBar title={title} />
                <div className="zl_all_pages_inner_content">
                    {props.location.pathname === "/settings" ? <Settings themHandler={themHandler} /> : props.children}
                </div>
                {/* <Footer /> */}
            </div>
        </div>
    );

}

export default Layout;
