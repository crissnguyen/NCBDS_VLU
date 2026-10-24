const { parentPort, workerData } = require('node:worker_threads');
const { readDocument } = require('./propertyImport');

readDocument({ originalname: workerData.originalname, buffer: Buffer.from(workerData.buffer) })
  .then(text => parentPort.postMessage({ text }))
  .catch(error => parentPort.postMessage({ error: error.message }));
