import React, {useEffect, useState} from "react";
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { USERS } from "../store/actionTypes";
import { useHistory } from "react-router-dom";
import axios from 'axios';

// import { mapStateToProps } from './mappers';

const LogInModule = ({ navigation }) => {
    let history = useHistory();
    const [seed, setSeed] = useState({})
    const dispatch = useDispatch()
    const error = useSelector(({userAction}) => userAction.error)

    const inputField = [
        { input: 'UserName', name: 'username', type: "text"},
        { input: 'Password', name: 'password', type: "password"}
    ];

    useEffect(() => {
        if(localStorage.getItem('user')) {
            history.push('/dashboard')
        }
    }, [])
    
    return (
        <section className="zl_login_section">
            <div className="zl_login_content container">
                <div className="zl_login_heading_text">
                    <h3 className="zl_login_heading">Login</h3>
                    <p className="zl_login_peregraph">Please input your name and password.</p>
                </div>
                <p className="zl_login_peregraph" style={{color: 'red'}}>{error}</p>
                    {inputField.map((inputValue, i) => (
                        <div className="zl_login_row row">
                            <div key={inputValue.name} className="zl_login_col_3 col-lg-3 col-md-6">
                                <div className="zl_login_input_content position-relative">
                                    <p className="zl_login_input_text">{inputValue.input}</p>
                                    <input type={inputValue.type} className="zl_login_input" name={`input${inputValue.name}`} placeholder="________" 
                                        value={seed[inputValue.name]}
                                        onChange={(e) => {
                                            setSeed({...seed, [inputValue.name]: e.target.value})
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                <div className="zl_login_btn">
                    <Link to={'/'} onClick={(e) => {
                    }} className="mx-auto">Login</Link>
                </div>
                <div className="zl_login_btn">
                    <Link to="/register" className="mx-auto">Register</Link>
                </div>
            </div>
        </section>
    );
}

export default connect(null, null)(LogInModule);