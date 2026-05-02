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
  if (file.includes('resources')) continue; // already fixed
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('useState<AppData>(() => getAppData())')) {
    // 1. replace state initialization
    content = content.replace(
      /const \[(data)(,\s*setData)?\] = useState<AppData>\(\(\) => getAppData\(\)\)/g,
      `const [$1$2] = useState<AppData | null>(null)\n  const [isLoading, setIsLoading] = useState(true)\n\n  useEffect(() => {\n    const appData = getAppData()\n    if ($2) {\n      $2(appData)\n    }\n    setIsLoading(false)\n  }, [])`
    );
    
    // We actually need a way to set data if only `const [data]` was used.
    // Let's refine the replacement:
    content = content.replace(
      /const \[data\] = useState<AppData \| null>\(null\)\n  const \[isLoading, setIsLoading\] = useState\(true\)\n\n  useEffect\(\(\) => \{\n    const appData = getAppData\(\)\n    if \(undefined\) \{\n      undefined\(appData\)\n    \}\n    setIsLoading\(false\)\n  \}, \[\]\)/,
      `const [data, setData] = useState<AppData | null>(null)\n  const [isLoading, setIsLoading] = useState(true)\n\n  useEffect(() => {\n    setData(getAppData())\n    setIsLoading(false)\n  }, [])`
    );

    content = content.replace(
      /const \[data, setData\] = useState<AppData \| null>\(null\)\n  const \[isLoading, setIsLoading\] = useState\(true\)\n\n  useEffect\(\(\) => \{\n    const appData = getAppData\(\)\n    if \(, setData\) \{\n      , setData\(appData\)\n    \}\n    setIsLoading\(false\)\n  \}, \[\]\)/,
      `const [data, setData] = useState<AppData | null>(null)\n  const [isLoading, setIsLoading] = useState(true)\n\n  useEffect(() => {\n    setData(getAppData())\n    setIsLoading(false)\n  }, [])`
    );
    
    // 2. Make sure useEffect is imported
    if (!content.includes('useEffect')) {
      content = content.replace(/import \{.*?useState.*?\} from 'react'/, (match) => {
        return match.replace('useState', 'useState, useEffect');
      });
      if (!content.includes('useEffect')) {
        content = `import { useEffect } from 'react'\n` + content;
      }
    }
    
    // 3. Add loading state guard before the first usage of `data.something` or in the return statement.
    // A simpler way is to just add a loading spinner at the beginning of the component's render body.
    // Let's find `return (` and insert the guard right before the outermost return.
    // Because finding the exact return is hard with regex, we can just look for `return (` that returns JSX and insert `if (isLoading || !data) return <div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" /></div>` before it.
    
    const loadingGuard = `\n  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }\n\n`;

    // Only inject if not already injected
    if (!content.includes('if (isLoading || !data)')) {
      // Find the return statement that returns JSX, usually `return (` or `return <`
      // It's safer to just find `return (` after our useEffect.
      // But some files have early returns. Let's insert right after the useEffect block.
      content = content.replace(/  \}, \[\]\)\n/, `  }, [])\n${loadingGuard}`);
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
}
