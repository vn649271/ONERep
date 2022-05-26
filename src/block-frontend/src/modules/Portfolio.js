import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import HeadingModule from '../components/Layout/HeadingComponent/Heading';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Link } from 'react-router-dom';
import Chart from "react-apexcharts";
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import UsersService from '../service/user.service'

const PortfolioModule = () => {
    // date picker
    const inputField = [1,2,3,4,5,6,7,8,9,10,11,12];
    const [seed, setSeed] = useState({})
    const [users, setUsers] = useState([])
    useEffect(() => {
        UsersService.getUsers().then((response) => {
            setUsers(response.data)
          });
    }, [])
    // const addUser = () => {
    //     UsersService.addUser()
    // }
    return (
        <>
            <section className="zl_securebackup_page">
                <HeadingModule name={'User Management'} />
                <div className="zl_securebackup_row row">
                    {inputField.map((inputValue,i) => (
                        <div className="zl_login_col_3 col-lg-3 col-md-6" key={inputValue}>
                            <div className="zl_login_input_content position-relative">
                                <p className="zl_login_input_text">{inputValue}</p>
                                <input type="text" className="zl_login_input" name={`input${inputValue}`} placeholder="________" 
                                    value={seed[inputValue]}
                                    onChange={(e) => {
                                        setSeed({...seed, [inputValue]: e.target.value})
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="zl_securebackup_btn">
                    <Link to={'#'} onClick={() => console.log('here') } className="mx-auto">Add</Link>
                </div>
                {users.map(user => user)}
            </section>
        </>
    );
}

export default connect(null, null)(PortfolioModule);
