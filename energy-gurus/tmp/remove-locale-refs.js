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

    // Replace @/app/[locale]/ with @/app/
    if (content.includes('@/app/[locale]/')) {
        content = content.replace(/@\/app\/\[locale\]\//g, '@/app/');
        changed = true;
    }

    // Replace /[locale]/ in strings (like revalidatePath or redirect) with /
    if (content.includes('/[locale]/')) {
        content = content.replace(/(['"`])\/\[locale\]\//g, '$1/');
        changed = true;
    }
    
    // Replace /${locale} in template strings
    if (content.includes('/${locale}')) {
        content = content.replace(/\/\$\{locale\}/g, '');
        changed = true;
    }
    
    // Remove { locale: string } from params in layout files
    if (content.includes('locale: string')) {
        content = content.replace(/,\s*locale:\s*string\s*/g, '');
        content = content.replace(/locale:\s*string\s*,?/g, '');
        changed = true;
    }

    // Remove const { locale } = await params;
    if (content.includes('const { locale } = await params;')) {
        content = content.replace(/const\s+\{\s*locale\s*\}\s*=\s*await\s+params;/g, '');
        changed = true;
    }

    if (content.includes('const { locale } = params;')) {
        content = content.replace(/const\s+\{\s*locale\s*\}\s*=\s*params;/g, '');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
