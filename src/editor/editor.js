import React, { Component } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import CM from "codemirror/lib/codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint";
import "codemirror/addon/hint/anyword-hint";
import "codemirror/addon/hint/show-hint.css";

var Pos = CM.Pos;

function forEach(arr, f) {
  for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
}

function forAllProps(obj, callback) {
  if (!Object.getOwnPropertyNames || !Object.getPrototypeOf) {
    for (var name in obj) callback(name);
  } else {
    for (var o = obj; o; o = Object.getPrototypeOf(o)) Object.getOwnPropertyNames(o).forEach(callback);
  }
}

function getCompletions(token, context, keywords, options) {
  var found = [],
    start = token.string,
    global = (options && options.globalScope) || window;
  // this function check the possible strings to add
  // if fit the standards, push to found
  function maybeAdd(str) {
    // str.lastIndexOf(start, 0) == 0 check whether the
    // start string (which typed) appear in the first character
    // slot
    // !arrayContains(found, str) check for duplication
    if (str.lastIndexOf(start, 0) == 0 && !found.includes(str)) found.push(str);
  }

  // context return a token when it is a property (console.log
  // for instance)
  if (context && context.length) {
    // If this is a property, see if it belongs to some object we can
    // find in the current environment.
    var obj = context.pop(),
      base;
    if (obj.type && obj.type.indexOf('variable') === 0) {
      if (options && options.additionalContext) base = options.additionalContext[obj.string];
      if (!options || options.useGlobalScope !== false) base = base || global[obj.string];
    } else if (obj.type == 'string') {
      base = '';
    } else if (obj.type == 'atom') {
      base = 1;
    } else if (obj.type == 'function') {
      if (global.jQuery != null && (obj.string == '$' || obj.string == 'jQuery') && typeof global.jQuery == 'function')
        base = global.jQuery();
      else if (global._ != null && obj.string == '_' && typeof global._ == 'function') base = global._();
    }
    while (base != null && context.length) base = base[context.pop().string];
  } else {
    // If not, just look in the global object and any local scope
    // (reading into JS mode internals to get at the local and global variables)
    for (var v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
    for (var v = token.state.globalVars; v; v = v.next) maybeAdd(v.name);

    // remove gloabl completion, which includes the leftover javascript
    // words
    /*if (!options || options.useGlobalScope !== false)
      gatherCompletions(global);*/

    // apply maybeAdd to all keywords
    // aka, check every word in keywords for addition
    forEach(keywords, maybeAdd);
  }
  return found;
}

// construct hint option from keywordlist
// keywords contain the list of hint words for completion
// getToken is the function that returns a token which is
// the token at the cursor
function scriptHint(editor, keywords, getToken, options) {
  // Find the token at the cursor
  // token contains the partial strings and its location
  var cur = editor.getCursor(),
    token = getToken(editor, cur);
  // token.type gives the type of the token (variable, operator,
  // comment, etc, exit if it is comment)
  // here, check with regex
  if (/\b(?:string|comment)\b/.test(token.type)) return;
  // retrieve the mode
  var innerMode = CM.innerMode(editor.getMode(), token.state);
  // not handling json
  if (innerMode.mode.helperType === 'json') return;
  token.state = innerMode.state;

  // If it's not a 'word-style' token, ignore the token.
  // here, check with regex
  if (!/^[\w$_]*$/.test(token.string)) {
    token = {
      start: cur.ch,
      end: cur.ch,
      string: '',
      state: token.state,
      type: token.string == '.' ? 'property' : null
    };
  } else if (token.end > cur.ch) {
    token.end = cur.ch;
    token.string = token.string.slice(0, cur.ch - token.start);
  }

  var tprop = token;
  // If it is a property, find out what it is a property of.
  // check for type property
  // for instance: apple.core, core is the property, which is
  // identified with "."
  while (tprop.type == 'property') {
    tprop = getToken(editor, Pos(cur.line, tprop.start));
    if (tprop.string != '.') return;
    tprop = getToken(editor, Pos(cur.line, tprop.start));
    if (!context) var context = [];
    context.push(tprop);
  }
  // list is a list of candidate words
  return {
    list: getCompletions(token, context, keywords, options),
    from: Pos(cur.line, token.start),
    to: Pos(cur.line, token.end)
  };
}

CM.defineExtension('test', function(options) {
  console.log('test');
});

function unigramToken(e, cur) {
  return e.getTokenAt(cur);
}

var keywords = ['hahaha', 'I have a t-shirt', 'nice shirt'];

function myHint(editor, options) {
  return scriptHint(editor, keywords, unigramToken, options);
}
CM.registerHelper('hint', 'mine', myHint);

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

    const mirrorInstance = (
      <div className="editor-screen">
        <CodeMirror
          className="ReactCodeMirror2"
          value={this.props.value}
          options={options}
          height="100%"
          onKeyPress={(editor, event) => {
            console.log(CM.hint)
            editor.showHint(CM.hint.mine);
          }}
        />
      </div>
    );

    return mirrorInstance;
  }
}

export default Editor;
