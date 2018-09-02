const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const _ = require('lodash');
const { XMLHttpRequest } = require('xhr2');

const isDev = require('electron-is-dev');
const path = require('path');

const PythonShell = require('python-shell');
const processor_path = 'processors/processor.py';

const PDFJS = require('pdfjs-dist');
PDFJS.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js';

// the location where the electron side post data for python
const localConnect = 'http://localhost:5000/nexus';

let mainWindow;

var processor = new PythonShell(processor_path, {
  mode: 'text',
  pythonPath: 'python3'
});
processor.on('message', message => {
  console.log(message);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    title: 'Imitation-Editor'
  });

  // if dev, load from localhost, else load from html
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

  mainWindow.on('closed', () => (mainWindow = null));
}

function httpPost(theUrl, text) {
  var data = {};
  data.description = text;
  var json = JSON.stringify(data);
  var xmlHttp = new XMLHttpRequest();
  // true for asynchronous
  xmlHttp.open('POST', theUrl, true);
  xmlHttp.onreadystatechange = () => {
    // wait for the response
    if (xmlHttp.readyState == XMLHttpRequest.DONE) {
      mainWindow.webContents.send('hint:ready', 'Success');
    }
  };
  xmlHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xmlHttp.send(json);
}

function combineText(texts) {
  return texts.items.map(x => x.str).join(' ');
}

function collectPagePromises(docs) {
  const pagePromises = [];
  for (dn = 0; dn < docs.length; dn++) {
    let doc = docs[dn];
    for (pn = 1; pn <= doc.pdfInfo.numPages; pn++) {
      pagePromises.push(doc.getPage(pn));
    }
  }

  return pagePromises;
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  processor.end(function(err) {
    if (err) {
      throw err;
    }
  });

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('files:added', (event, filePaths) => {
  const filePromises = filePaths.map(x => PDFJS.getDocument(`file://${x}`));
  Promise.all(filePromises)
    .then(docs => collectPagePromises(docs))
    .then(pagePromises =>
      Promise.all(pagePromises)
        .then(pages => pages.map(x => x.getTextContent()))
        .then(texts =>
          Promise.all(texts).then(textContents => {
            const allTextInEachDoc = textContents.map(x => combineText(x));
            const allText = allTextInEachDoc.join(' ');
            httpPost(localConnect, allText);
          })
        )
    );
});
