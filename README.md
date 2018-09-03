# instructions
This program can read the pdf files you give it and extract the words and phrases from the document. Then it will turn into writing mode, in which it will give hint for your writing (which is supposed to be in the same field as the files you give it).

Install the dependencies using:
```
yarn install
```
Start the program using:
```
yarn run electron-dev
```
Then, you can drag and drop the pdf files you want it to learn from.

Currently, the program has a delayed bug, it only learns the file you gave it during the previous session. 

# construction notes
- 1 create-react-app texteditor: create the folder for the electron part
- 2 cd texteditor; yarn add electron --dev: add electron to the project
- 3 add the electron.js file, install by yarn add electron-is-dev
- 4 program design:
A drag and drop box for pdf file
after drop, read in the file content and generate bigram stats
- 5 install lodash, react-redux, react-dropzone
- 6 remove display: flex; from the drop-message to make text at the
center
- 7 change the order of isDragActive, isDragReject condition in
renderChildren to make the drag work
- 8 bug that the program can't recognize pdf, try use base64 encoded,
https://mozilla.github.io/pdf.js/examples/ no error, indicates the bug
is in the webpage side that pass in the info
- 9 PDFJS.getDocument('file://' + files[0].path) will cause Cross origin 
requests are only supported for protocol schemes: http, data, chrome, 
chrome-extension, https. This is due to the fact that webapp can not direct
access local file. Thus need to send to electron to open it.
- 10 Uncaught TypeError: fs.readFileSync is not a function can be caused by
electron and browserify, replace 
import electron, { ipcRenderer } from 'electron'
with
const electron = window.require("electron")
const { ipcRenderer } = electron;
solves it
- 11 run into Error: Invalid page request: which is causing by requesting page 0: the pdf.js
use range of pages [1, num of pages]!!!!!!!!!!!!
- 12 async functions such as promise doesn't do well with return. Hard to handle
- 13 implement server side first, then the client side
- 14 will put text in the center of screen
position: absolute;
top: 50%;
bottom: 50%;
- 15 height: 100vh; tells the program to occupy 100% of the screen
- 16 Unexpected token import can be caused by ES6 syntax in the script,
just need to add type="module" in the <script/>
- 17 restart window using: .close() then = null
- 18 pdfminer not work with python but pdfminer.six OK
- 19 some bugs right now: python script is async, can start writing to
file before js finishing processing. Fixed by promise handling
and concatenate all texts into 1 data
- 20 Also the hint scripts loaded by the editor section is 
the old one
- 21 getTokenAt and getLineTokens are in method, which uses takeToken
from the line/highlight.js
- 22 get all tokens from a line, the multigram completion can be made
this way: e.getLineTokens(cur.line). However need to be cautious:
in a line " " counts as a token, also do other operators ("-" for
instance)
- 23 can use componentDidMount to clear history
- 24 can define new extension in editor.js with: 
CM.defineExtension('test', function(options) {
  console.log('test');
});
- 25 most of the hints are lost due to for (var prop in defaultOptions) out[prop] = defaultOptions[prop]; which sets the options to default and hints to auto

# comments
## Features
- Problem: When open, the app has a black screen which is confusing to the users.
    - Solution: Give a message or a split screen.
- Problem: With no hint, the user will not know what is going on.
- Problem: CodeMirror didn't start the new line (wrap line) automatically. **_Check!!!!_**
- Comment: Show the pdf on the right side, for review writing.

## Code Issues
- Problem: No eslint file. **_Check!!!!_**
    - Solution: Find electron eslint online.
- Comment: Add prettier config file in vscode (find online or in Gongxia's github). **_Check!!!!_**
- Problem: Folder structure. **_Check!!!!_**
    - Solution: Python and pdf should be in their individual folders.
- Comment: Combine all text files into a single readme, use markdown syntax to separate the section. **_Check!!!!_**
- Comment: Shouldn't change the node_module files. Use official APIs.
- Comment: public usually for non-dynamic: for install html or css. For codes that have logics, should be put into src (all .js). **_Check!!!!_**
- Comment: Electron-react file structure (usually 1 App.js or index.js)) **_Check!!!!_**
- Comment: reduce comments **_Check!!!!_**
- Comment: block other than inline for comments longer than 2 lines **_Check!!!!_**
