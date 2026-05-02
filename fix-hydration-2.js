const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('page.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(appDir);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('if () {')) {
    content = content.replace(
      /const \[data\] = useState<AppData \| null>\(null\)/,
      `const [data, setData] = useState<AppData | null>(null)`
    );
    
    content = content.replace(
      /if \(\) \{\n      \(appData\)\n    \}/g,
      `setData(appData)`
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed syntax error in:', file);
  } else if (content.includes('if (, setData) {')) {
    content = content.replace(
      /if \(, setData\) \{\n      , setData\(appData\)\n    \}/g,
      `setData(appData)`
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed syntax error in:', file);
  }
}
