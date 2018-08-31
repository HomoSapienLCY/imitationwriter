import React, { Component } from "react";
import Dropzone from "react-dropzone";
const electron = window.require("electron");
// the following code that is commented out 
// will cause window not found
//import { electron } from "window";
const { ipcRenderer } = electron;

class FileSelectScreen extends Component {
  onDrop = files => {
    // check for valid file != 0
    if (files.length > 0) {
      const filePaths = files.map(x => x.path);
      ipcRenderer.send("files:added", filePaths);
      ipcRenderer.on("hint:ready", (event, path) => {
        this.props.history.push("/editor")
      });
    }
  };

  // showing hint message for file dropping
  renderChildren({ isDragActive, isDragReject }) {
    if (isDragReject) {
      return <h4 className="drop-message">wrong file type</h4>;
    } else if (isDragActive) {
      return <h4 className="drop-message">accept and analyze</h4>;
    } else {
      return (
        <h4 className="drop-message">
          Drag and drop some files on me, or click to select.
        </h4>
      );
    }
  }

  render() {
    return (
      <div className="imitate-screen">
        <Dropzone
          onDrop={this.onDrop}
          multiple
          accept="application/pdf"
          className="dropzone"
          activeClassName="dropzone-active"
          rejectClassName="dropzone-reject"
        >
          {this.renderChildren}
        </Dropzone>
      </div>
    );
  }
}

export default FileSelectScreen;
