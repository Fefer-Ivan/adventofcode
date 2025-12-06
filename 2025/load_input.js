const fs = require('node:fs');
const path = require('path');

function getCurrentCollection() {
  return db[path.basename(process.cwd())];
}

function loadTxtData(dir) {
  const coll = getCurrentCollection();
  coll.drop();
  print("Writing into collection: " + coll.getFullName());
  for (file of fs.readdirSync(dir)) {
    if (!file.endsWith(".txt")) {
      continue;
    }
    const filename = path.join(dir, file);
    const doc = {_id: file, data: fs.readFileSync(filename, 'utf-8')};
    coll.insertOne(doc);
    print("Inserted " + filename);
  } 
}

print("Loading inputs from " + process.cwd());
loadTxtData(process.cwd());
