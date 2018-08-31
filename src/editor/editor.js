import React, { Component } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
// hint has to be imported from the js codemirror library
import CM from "codemirror/lib/codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint";
import "codemirror/addon/hint/anyword-hint";
import "codemirror/addon/hint/show-hint.css";

class Editor extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const options = {
      theme: "monokai",
      mode: "javascript",
      lineWrapping: true,
    };

    // give the classname for formating in css
    // onKeyPress event works much better than onKeyUp, onKeyDown
    // and onInput
    const mirrorInstance = (
      <div className="editor-screen">
        <CodeMirror
          className="ReactCodeMirror2"
          value={this.props.value}
          options={options}
          height="100%"
          onKeyPress={(editor, event) => {
            //console.log(event.keyCode);
            editor.showHint(CM.hint.javascript);
          }}
        />
      </div>
    );

    return mirrorInstance;
  }
}

export default Editor;
