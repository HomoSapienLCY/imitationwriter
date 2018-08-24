import React, { Component } from "react";
import { HashRouter as Router, Route, Switch, Redirect, Link } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";
import FileSelectScreen from "./screens/FileSelectScreen";
import Editor from './editor/editor'

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route path="/editor" component={Editor} />
            <Route path="/" component={FileSelectScreen} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
