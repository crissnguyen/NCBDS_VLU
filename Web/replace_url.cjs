const fs = require('fs');
const path = require('path');

const targetStr = 'http://localhost:5001';
const replaceStr = "https://ncbds-vlu.onrender.com";

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(targetStr)) {
                content = content.split(targetStr).join(replaceStr);
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

walkDir('./src');
console.log('Done replacing URLs');
