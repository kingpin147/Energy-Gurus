const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/app/[locale]');
const destDir = path.join(__dirname, '../src/app');

function moveDir(src, dest) {
    const list = fs.readdirSync(src);
    for (const item of list) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
            if (item === 'api') {
                // If it's an api dir, move its contents into dest/api
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath);
                }
                const apiList = fs.readdirSync(srcPath);
                for (const apiItem of apiList) {
                    fs.renameSync(path.join(srcPath, apiItem), path.join(destPath, apiItem));
                }
            } else {
                fs.renameSync(srcPath, destPath);
            }
        } else {
            fs.renameSync(srcPath, destPath);
        }
    }
}

moveDir(srcDir, destDir);
console.log('Moved all files from [locale] to app');
