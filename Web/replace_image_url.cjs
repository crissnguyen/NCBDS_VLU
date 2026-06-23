const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;

            // PropertyCard.jsx, PropertyDetail.jsx
            if (content.includes("img.startsWith('http') ? img : `https://ncbds-vlu.onrender.com${img}`")) {
                content = content.replace(/img\.startsWith\('http'\) \? img : `https:\/\/ncbds-vlu\.onrender\.com\$\{img\}`/g, 
                "img.startsWith('http') || img.startsWith('data:image') ? img : `https://ncbds-vlu.onrender.com${img}`");
                updated = true;
            }

            // AdminDashboard.jsx (p.images[0])
            if (content.includes("`https://ncbds-vlu.onrender.com${p.images[0]}`")) {
                content = content.replace(/`https:\/\/ncbds-vlu\.onrender\.com\$\{p\.images\[0\]\}`/g,
                "(p.images[0].startsWith('http') || p.images[0].startsWith('data:image') ? p.images[0] : `https://ncbds-vlu.onrender.com${p.images[0]}`)");
                updated = true;
            }

            // Search.jsx, Home.jsx (property.images[0])
            if (content.includes("`https://ncbds-vlu.onrender.com${property.images[0]}`")) {
                content = content.replace(/`https:\/\/ncbds-vlu\.onrender\.com\$\{property\.images\[0\]\}`/g,
                "(property.images[0].startsWith('http') || property.images[0].startsWith('data:image') ? property.images[0] : `https://ncbds-vlu.onrender.com${property.images[0]}`)");
                updated = true;
            }

            // PropertyDetail.jsx (img)
            if (content.includes("`https://ncbds-vlu.onrender.com${img}`") && !content.includes("data:image")) {
                content = content.replace(/`https:\/\/ncbds-vlu\.onrender\.com\$\{img\}`/g,
                "(img.startsWith('http') || img.startsWith('data:image') ? img : `https://ncbds-vlu.onrender.com${img}`)");
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

walkDir('./src');
console.log('Done');
