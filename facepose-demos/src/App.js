import React, { Component } from "react";
import "./css/App.css";
import Dashboard from "./Dashboard"

class App extends Component {
  render() {
    return (
      <div className="app">
        {/* <Particles params={particleOpt} /> */}
        <Dashboard />
      </div>
    );
  }
}

export default App;
