import { connect } from 'react-redux';

import SideBar from "./SideBar";

const mapStateToProps = state => {
    return {
        user: state.userAction.user || null,
    }
}

export default connect(mapStateToProps)(SideBar);
