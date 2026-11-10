const fs = require('fs');

const script = fs.readFileSync('script.js.bak3', 'utf8');
const tourJson = fs.readFileSync('tourdata_json.txt', 'utf8').trim();
const newFuncs = fs.readFileSync('new_funcs.js', 'utf8');

JSON.parse(tourJson); // validate

// Find tourData boundaries
const startMarker = 'const tourData = {';
const startIdx = script.indexOf(startMarker);
let depth = 0, endIdx = -1;
for (let i = startIdx + startMarker.length - 1; i < script.length; i++) {
  if (script[i] === '{') depth++;
  else if (script[i] === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
}
const beforeTourData = script.slice(0, startIdx);
const afterTourData = script.slice(endIdx);

// Find openTourModal
const funcName = 'function openTourModal(type) {';
const funcStart = afterTourData.indexOf(funcName);
let fDepth = 0, fEnd = -1;
for (let i = funcStart + funcName.length - 1; i < afterTourData.length; i++) {
  if (afterTourData[i] === '{') fDepth++;
  else if (afterTourData[i] === '}') { fDepth--; if (fDepth === 0) { fEnd = i + 1; break; } }
}
const beforeFunc = afterTourData.slice(0, funcStart);
const afterFunc = afterTourData.slice(fEnd);

const newTourData = 'const tourData = ' + tourJson + ';';
const finalScript = beforeTourData + newTourData + beforeFunc + '\n' + newFuncs + '\n' + afterFunc;

fs.writeFileSync('script.js', finalScript);
console.log('Done! Original:', script.length, 'New:', finalScript.length);
