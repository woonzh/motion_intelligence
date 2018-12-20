import React, { Component } from "react";
import "./css/SideBar.css";
import { logicalOr } from "@tensorflow/tfjs";
import CircularProgressbar from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import logo from "./assets/logo.png";

class SideBar extends Component {
  render() {
    return (
      <div className="side-bar-wrapper">
        {/* <h1>Crowd Count: {this.props.poseCount}</h1> */}
        <div className="progress-bar-wrapper">
          <CircularProgressbar
            className="progress-bar"
            percentage={this.props.poseCount * 5}
            text={`${this.props.poseCount}`}
            styles={{
                // Customize the root svg element
                root: {},
                // Customize the path, i.e. the part that's "complete"
                path: {
                  // Tweak path color:
                  stroke: 'aqua',
                  // Tweak path to use flat or rounded ends:
                  strokeLinecap: 'butt',
                  // Tweak transition animation:
                  transition: 'stroke-dashoffset 0.5s ease 0s',
                },
                // Customize the circle behind the path
                trail: {
                  // Tweak the trail color:
                  stroke: '#111',
                },
                // Customize the text
                text: {
                  // Tweak text color:
                  fill: 'aqua',
                  // Tweak text size:
                  fontSize: '22px',
                },
              }}
          />
          <div className="progress-bar-title">CROWD COUNT</div>
        </div>
        <img className="logo" src={logo} />
      </div>
    );
  }
}

export default SideBar;
