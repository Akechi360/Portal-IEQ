const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, '..', 'Ruijie Cloud API Reference Manual V2.pdf');
const buffer = fs.readFileSync(pdfPath);

let text = "";
for (let i = 0; i < buffer.length; i++) {
  const char = buffer[i];
  if ((char >= 32 && char <= 126) || char === 10 || char === 13) {
    text += String.fromCharCode(char);
  } else {
    text += " ";
  }
}

const regex = /\/[a-zA-Z0-9_\-\/]{3,}/g;
const matches = text.match(regex) || [];
const uniquePaths = Array.from(new Set(matches)).filter(p => p.includes('auth') || p.includes('user') || p.includes('voucher') || p.includes('authorize') || p.includes('dev') || p.includes('client'));

console.log("Filtered Paths in PDF:");
console.log(uniquePaths.slice(0, 100));
