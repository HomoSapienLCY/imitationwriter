import React, { Component } from "react";
import Dropzone from "react-dropzone";
const electron = window.require("electron");
// the following code that is commented out 
// will cause window not found
//import { electron } from "window";
const { ipcRenderer } = electron;

class FileSelectScreen extends Component {
  onDrop = files => {
    // invalid file types are not added to files object
    if (files.length > 0) {
      // extract paths into an array
      const filePaths = files.map(x => x.path);
      console.log(filePaths);
      // send the files to electron
      ipcRenderer.send("files:added", filePaths);
      // listen to the hint ready event 
      ipcRenderer.on("hint:ready", (event, path) => {
        this.props.history.push("/editor")
      });
    }
  };

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
          // allow multiple components
          multiple
          // only allow pdf files
          accept="application/pdf"
          className="dropzone"
          // show message when the file is valid
          activeClassName="dropzone-active"
          // show message when the file is not valid
          rejectClassName="dropzone-reject"
        >
          {this.renderChildren}
        </Dropzone>
      </div>
    );
  }
}

export default FileSelectScreen;
