const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, '../src'));

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // A simpler approach: replace lines that just have `      ,` or `      ,\r\n` or `      ,\n`
    // Wait, let's just do a string replacement. Since the indentation is fixed, we can just replace:
    // `,\n    },` with `\n    },`
    // But since it might have \r\n, we should just match the exact substring.
    const newContent = content.replace(/,\s*\r?\n\s*\}/g, '\n    }');

    if (content !== newContent) {
        content = newContent;
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
