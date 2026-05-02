const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/daily-log/page.tsx',
  'app/goals/page.tsx',
  'app/weekly-review/page.tsx',
  'app/topics/page.tsx'
];

for (const relPath of filesToFix) {
  const file = path.join(__dirname, relPath);
  let content = fs.readFileSync(file, 'utf8');

  // We want to find the chunk:

  
  //   const [showForm, setShowForm] = useState(false)
  //   const [form, setForm] = useState({ ... })
  // and move it above the `useEffect`.

  // The hook area usually looks like:
  /*
  const [data, setData] = useState<AppData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { ... }, [])

  if (isLoading || !data) { ... }

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    ...
  })
  */

  const hookStartRegex = /const \[showForm, setShowForm\] = useState\(false\)/;
  
  const match = content.match(hookStartRegex);
  if (!match) continue;

  const hookStartIndex = match.index;
  // find the end of the `form` useState. It ends with `  })\n`
  const formEndRegex = /  \}\)\n/;
  // We search from hookStartIndex
  const contentAfterHookStart = content.slice(hookStartIndex);
  const endMatch = contentAfterHookStart.match(formEndRegex);
  
  if (endMatch) {
    const hookEndIndex = hookStartIndex + endMatch.index + endMatch[0].length;
    const hooksToMove = content.slice(hookStartIndex, hookEndIndex);

    // remove hooks from original place
    content = content.slice(0, hookStartIndex) + content.slice(hookEndIndex);

    // insert hooks right after `const [isLoading, setIsLoading] = useState(true)`
    const insertAfter = 'const [isLoading, setIsLoading] = useState(true)\n';
    const insertIndex = content.indexOf(insertAfter) + insertAfter.length;
    
    content = content.slice(0, insertIndex) + '  ' + hooksToMove.trim() + '\n\n' + content.slice(insertIndex);
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed hooks in:', file);
  }
}
