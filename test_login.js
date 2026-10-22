const fs = require('fs');
const content = fs.readFileSync('src/context/ConnectContext.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 890; i < 920; i++) {
  console.log((i+1) + ': ' + lines[i]);
}
