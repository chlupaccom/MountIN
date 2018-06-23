"use strict";

import React from 'react';
import Styled from 'styled-components';


class PlainFooter extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.className}>
                <p>© {new Date().getFullYear()} sebis. All rights reserved.</p>
            </div>
        );
    }
}

export const Footer = Styled(PlainFooter)`
    max-height: 35px;
    bottom: 20px;
    left: 0;
    right: 0;
    position: fixed;
    color:white;
    > p {
        text-align: center;
        margin: 0 0 -20px;
    }
`;