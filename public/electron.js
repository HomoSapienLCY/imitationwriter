const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
const _ = require("lodash");
const { XMLHttpRequest } = require("xhr2");

const isDev = require("electron-is-dev");
const path = require("path");

// python analysis and generation script
const PythonShell = require("python-shell");
const processor_path = "processor.py";

// = import PDFJS from "pdfjs-dist"; in react
const PDFJS = require("pdfjs-dist");
PDFJS.GlobalWorkerOptions.workerSrc = "pdfjs-dist/build/pdf.worker.js";

// the location where the electron side post data for python
const localConnect = "http://localhost:5000/nexus";

let mainWindow;

var processor = new PythonShell(processor_path, {
  mode: "text",
  pythonPath: "python3"
});
processor.on("message", message => {
  console.log(message);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    title: "Imitation-Editor"
  });

  // if dev, load from localhost, else load from html
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.on("closed", () => (mainWindow = null));
}

// legacy code using a different mechanism (posting filename
// other than content)
/*
function httpPostFilename(theUrl, filePaths) {
  var data = {};
  data.filePaths = filePaths;
  // make data into json
  var json = JSON.stringify(data);
  // open http for post
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("POST", theUrl, true); // true for asynchronous
  xmlHttp.onreadystatechange = () => {
    // wait for the response
    if (xmlHttp.readyState == XMLHttpRequest.DONE) {
      mainWindow.webContents.send("hint:ready", "Success");
    }
  };
  xmlHttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xmlHttp.send(json);
}
*/

function httpPost(theUrl, text, pageNum) {
  // construct and fill in data
  var data = {};
  data.pageNum = pageNum;
  data.description = text;
  // make data into json
  var json = JSON.stringify(data);
  // open http for post
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("POST", theUrl, true); // true for asynchronous
  xmlHttp.onreadystatechange = () => {
    // wait for the response
    if (xmlHttp.readyState == XMLHttpRequest.DONE) {
      mainWindow.webContents.send("hint:ready", "Success");
    }
  };
  xmlHttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xmlHttp.send(json);
}

function readPage(page, pageNum) {
  page
    .getTextContent()
    .then(textContent => textContent.items.map(x => x.str).join(" "))
    .then(pageText => {
      httpPost(localConnect, pageText, pageNum);
    });
}

function collectPages(doc) {
  var docText = "";
  for (pn = 1; pn <= doc.pdfInfo.numPages; pn++) {
    doc.getPage(pn).then(
      page => {
        pageText = readPage(page, pn);
      },
      reason => {
        // PDF loading error
        console.error(reason);
      }
    );
  }
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  // end python
  processor.end(function(err) {
    if (err) {
      throw err;
    }
  });

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("files:added", (event, filePaths) => {
  // legacy code using a different mechanism (posting filename
  // other than content)
  /*
  httpPostFilename(localConnect, filePaths)
  */

  _.each(filePaths, filePath => {
    renew = true;
    PDFJS.getDocument(`file://${filePath}`).then(
      pdfDoc => {
        console.log("PDF loaded");
        collectPages(pdfDoc);
      },
      reason => {
        // PDF loading error
        console.error(reason);
      }
    );
  });
});
