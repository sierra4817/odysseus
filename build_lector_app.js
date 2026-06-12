const fs = require('fs');
const path = require('path');

const manuscriptPath = 'C:\\Users\\as\\Desktop\\Audiolibro - El Capital Invisible\\Manuscrito - El Capital Invisible.md';
const templatePath = 'C:\\Users\\as\\Downloads\\app-lector-capital-invisible\\app_template.js';
const outputJsPath = 'C:\\Users\\as\\Downloads\\app-lector-capital-invisible\\app.js';

const content = fs.readFileSync(manuscriptPath, 'utf8');
const lines = content.split('\n');

const chapters = [];
let currentChapter = null;

// Sentence splitter helper
function splitIntoSentences(text) {
    if (!text.trim()) return [];
    
    const regex = /([^.!?]+[.!?]+)\s*/g;
    const matches = text.match(regex);
    if (!matches) {
        return [text.trim()];
    }
    
    const matchedLength = matches.join('').length;
    const sentences = matches.map(s => s.trim());
    if (matchedLength < text.length) {
        const remaining = text.substring(matchedLength).trim();
        if (remaining) {
            sentences.push(remaining);
        }
    }
    return sentences;
}

for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('# ')) {
        const titleText = line.substring(2).trim();
        if (titleText !== 'EL CAPITAL INVISIBLE') { // Skip main title
            currentChapter = {
                title: titleText,
                sections: []
            };
            chapters.push(currentChapter);
        }
    } else if (line.startsWith('## ')) {
        const subTitleText = line.substring(3).trim();
        if (currentChapter) {
            currentChapter.sections.push({
                type: 'h4',
                text: subTitleText
            });
        }
    } else if (line.startsWith('---')) {
        if (currentChapter) {
            currentChapter.sections.push({
                type: 'hr'
            });
        }
    } else if (line.startsWith('**Albert Sierra**')) {
        continue;
    } else {
        const sentences = splitIntoSentences(line);
        if (sentences.length > 0 && currentChapter) {
            currentChapter.sections.push({
                type: 'p',
                sentences: sentences
            });
        }
    }
}

// Read template and replace placeholder
if (!fs.existsSync(templatePath)) {
    console.error('Template file not found at:', templatePath);
    process.exit(1);
}

const templateContent = fs.readFileSync(templatePath, 'utf8');
const bookDataJson = `const bookData = ${JSON.stringify(chapters, null, 4)};`;
const finalContent = templateContent.replace('// BOOK_DATA_PLACEHOLDER', bookDataJson);

fs.writeFileSync(outputJsPath, finalContent);
console.log('App JS script successfully generated from app_template.js!');
