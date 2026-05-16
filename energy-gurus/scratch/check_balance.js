
import fs from 'fs';

const content = fs.readFileSync('d:/downloads 6-11-2025/Energy Gurus/energy-gurus/src/app/[locale]/(public)/page.tsx', 'utf8');

let curly = 0;
let paren = 0;
let bracket = 0;

for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') curly++;
    if (content[i] === '}') curly--;
    if (content[i] === '(') paren++;
    if (content[i] === ')') paren--;
    if (content[i] === '[') bracket++;
    if (content[i] === ']') bracket--;
    
    if (curly < 0 || paren < 0 || bracket < 0) {
        console.log(`Mismatch at char ${i}: {:${curly}, (:${paren}, [:${bracket}`);
    }
}

console.log(`Final: {:${curly}, (:${paren}, [:${bracket}`);
