const fs = require('fs');
const glob = require('glob');
const path = require('path');

const srcDir = path.join(__dirname, 'src/screens/staff');

// We use a bash find command instead of glob to avoid dependencies if glob isn't installed
const { execSync } = require('child_process');
const files = execSync(`find ${srcDir} -name "*.tsx"`).toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Check if SafeAreaView is imported from react-native
  const reactNativeImportRegex = /import\s+{([^}]*)}\s+from\s+['"]react-native['"]\s*;/g;
  
  content = content.replace(reactNativeImportRegex, (match, imports) => {
    if (imports.includes('SafeAreaView')) {
      changed = true;
      // Remove SafeAreaView from the list
      const newImports = imports.split(',').map(i => i.trim()).filter(i => i !== 'SafeAreaView' && i !== '');
      
      let newSection = `import { SafeAreaView } from 'react-native-safe-area-context';\n`;
      if (newImports.length > 0) {
        newSection += `import { ${newImports.join(', ')} } from 'react-native';`;
      }
      return newSection;
    }
    return match;
  });

  // Also replace SafeAreaView from react-native in multi-line imports
  // A simple way is to just use a global string replace if the regex missed formatting
  if (!changed && content.includes('SafeAreaView') && content.includes(`from 'react-native'`)) {
    // If we missed multi line imports
    const multiLineMatch = content.match(/import\s+{([^}]*SafeAreaView[^}]*)}\s+from\s+['"]react-native['"]\s*;/m);
    if(multiLineMatch) {
        changed = true;
        const imports = multiLineMatch[1];
        const newImports = imports.split(',').map(i => i.trim()).filter(i => i !== 'SafeAreaView' && i !== '');
        
        let newSection = `import { SafeAreaView } from 'react-native-safe-area-context';\n`;
        if (newImports.length > 0) {
            newSection += `import {\n  ${newImports.join(',\n  ')}\n} from 'react-native';`;
        }
        content = content.replace(multiLineMatch[0], newSection);
    }
  }

  // Also some files might already have paddingTop: Platform.OS ... which we should leave alone, 
  // but SafeAreaView from react-native-safe-area-context doesn't need it. That's fine.

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', path.basename(file));
  }
});

console.log('Done fixing SafeAreaView!');
