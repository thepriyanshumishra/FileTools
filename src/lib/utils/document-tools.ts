// Document processing tools

export async function formatJSON(file: File): Promise<Blob> {
  const text = await file.text();
  const json = JSON.parse(text);
  const formatted = JSON.stringify(json, null, 2);
  return new Blob([formatted], { type: 'application/json' });
}

export async function minifyJSON(file: File): Promise<Blob> {
  const text = await file.text();
  const json = JSON.parse(text);
  const minified = JSON.stringify(json);
  return new Blob([minified], { type: 'application/json' });
}

export async function validateJSON(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    const text = await file.text();
    JSON.parse(text);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}

export async function jsonToCSV(file: File): Promise<Blob> {
  const text = await file.text();
  const json = JSON.parse(text);
  const array = Array.isArray(json) ? json : [json];
  
  if (array.length === 0) {
    return new Blob([''], { type: 'text/csv' });
  }
  
  const headers = Object.keys(array[0]);
  const csv = [
    headers.join(','),
    ...array.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
  ].join('\n');
  
  return new Blob([csv], { type: 'text/csv' });
}

export async function csvToJSON(file: File): Promise<Blob> {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return new Blob(['[]'], { type: 'application/json' });
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || '';
    });
    return obj;
  });
  
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

export async function formatXML(file: File): Promise<Blob> {
  const text = await file.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  const serializer = new XMLSerializer();
  const formatted = serializer.serializeToString(xmlDoc);
  return new Blob([formatted], { type: 'application/xml' });
}

export async function validateXML(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    const text = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    const parseError = xmlDoc.querySelector('parsererror');
    
    if (parseError) {
      return { valid: false, error: parseError.textContent || 'Invalid XML' };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}

export async function formatCSS(file: File): Promise<Blob> {
  const text = await file.text();
  // Basic CSS formatting
  const formatted = text
    .replace(/\s*{\s*/g, ' {\n  ')
    .replace(/\s*}\s*/g, '\n}\n')
    .replace(/\s*;\s*/g, ';\n  ')
    .replace(/\s*,\s*/g, ', ');
  return new Blob([formatted], { type: 'text/css' });
}

export async function minifyCSS(file: File): Promise<Blob> {
  const text = await file.text();
  const minified = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .trim();
  return new Blob([minified], { type: 'text/css' });
}

export async function formatHTML(file: File): Promise<Blob> {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const formatted = doc.documentElement.outerHTML;
  return new Blob([formatted], { type: 'text/html' });
}

export async function minifyHTML(file: File): Promise<Blob> {
  const text = await file.text();
  const minified = text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
  return new Blob([minified], { type: 'text/html' });
}

export async function formatJS(file: File): Promise<Blob> {
  const text = await file.text();
  // Basic JS formatting - in production use prettier or similar
  const formatted = text
    .replace(/\s*{\s*/g, ' {\n  ')
    .replace(/\s*}\s*/g, '\n}\n')
    .replace(/\s*;\s*/g, ';\n');
  return new Blob([formatted], { type: 'text/javascript' });
}

export async function minifyJS(file: File): Promise<Blob> {
  const text = await file.text();
  const minified = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return new Blob([minified], { type: 'text/javascript' });
}

export async function textToPDF(file: File): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const text = await file.text();
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const lines = text.split('\n');
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;
  const margin = 50;
  const lineHeight = 15;
  let y = height - margin;

  for (const line of lines) {
    if (y < margin + lineHeight) {
      page = pdfDoc.addPage();
      y = height - margin;
    }
    const cleanLine = line.trimEnd();
    page.drawText(cleanLine, {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

export async function formatText(file: File, action: string = 'uppercase'): Promise<Blob> {
  const text = await file.text();
  let result = text;
  if (action === 'uppercase') {
    result = text.toUpperCase();
  } else if (action === 'lowercase') {
    result = text.toLowerCase();
  } else if (action === 'trim') {
    result = text.split('\n').map(l => l.trim()).join('\n');
  } else if (action === 'reverse') {
    result = text.split('').reverse().join('');
  }
  return new Blob([result], { type: 'text/plain' });
}

export async function validateCSV(file: File): Promise<{ valid: boolean; error?: string }> {
  const text = await file.text();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) {
    return { valid: false, error: "CSV file is empty" };
  }

  let colCount = -1;
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (colCount === -1) {
      colCount = cols.length;
    } else if (cols.length !== colCount) {
      return {
        valid: false,
        error: `Column count mismatch at line ${i + 1}: expected ${colCount} columns, found ${cols.length}`
      };
    }
  }

  return { valid: true };
}

export function markdownToHTMLText(md: string): string {
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\n$/gim, '<br />');
  
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1<\/ul>');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Markdown Export</title></head><body>${html}</body></html>`;
}

export async function markdownToPDF(file: File): Promise<Blob> {
  const text = await file.text();
  const cleanText = text
    .replace(/^#+ /gim, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`(.*?)`/g, '$1');
  
  const dummyFile = new File([cleanText], file.name);
  return await textToPDF(dummyFile);
}

export async function extractImagesFromPPTX(file: File): Promise<Blob[]> {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const imageBlobs: Blob[] = [];

  const mediaFolder = zip.folder("ppt/media");
  if (mediaFolder) {
    const files = Object.keys(mediaFolder.files);
    for (const filename of files) {
      if (filename.match(/\.(png|jpe?g|gif|webp|svg)$/i)) {
        const baseName = filename.split('/').pop() || "";
        const zipFile = mediaFolder.file(baseName);
        if (zipFile) {
          const blob = await zipFile.async("blob");
          imageBlobs.push(blob);
        }
      }
    }
  }

  return imageBlobs;
}

export async function extractTextFromPPTX(file: File): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  let resultText = "";
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const matchA = a.match(/\d+/);
      const matchB = b.match(/\d+/);
      const numA = parseInt(matchA ? matchA[0] : "0");
      const numB = parseInt(matchB ? matchB[0] : "0");
      return numA - numB;
    });

  for (const slidePath of slideFiles) {
    const slideFile = zip.file(slidePath);
    if (!slideFile) continue;
    
    const xmlText = await slideFile.async("text");
    const matchNum = slidePath.match(/\d+/);
    const slideNum = matchNum ? matchNum[0] : "1";
    resultText += `--- Slide ${slideNum} ---\n`;
    
    const matches = xmlText.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g);
    let slideText = "";
    for (const match of matches) {
      if (match[1]) {
        const decoded = match[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
        slideText += decoded + " ";
      }
    }
    
    resultText += slideText.trim() + "\n\n";
  }
  
  if (!resultText) {
    resultText = "No readable text found in presentation slides.";
  }

  return new Blob([resultText], { type: 'text/plain' });
}

export async function extractTextFromDOCX(file: File): Promise<Blob> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return new Blob([result.value], { type: "text/plain" });
}

export async function docxToHTML(file: File): Promise<Blob> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return new Blob([result.value], { type: "text/html" });
}

export async function xlsxToCSV(file: File): Promise<Blob> {
  const XLSX = await import("xlsx");
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  return new Blob([csvContent], { type: "text/csv" });
}

export async function xlsxToJSON(file: File): Promise<Blob> {
  const XLSX = await import("xlsx");
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonContent = XLSX.utils.sheet_to_json(worksheet);
  return new Blob([JSON.stringify(jsonContent, null, 2)], { type: "application/json" });
}

export async function xlsxToGridData(file: File): Promise<{ sheetNames: string[]; sheets: Record<string, any[][]> }> {
  const XLSX = await import("xlsx");
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetsData: Record<string, any[][]> = {};
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    sheetsData[sheetName] = rows;
  }
  
  return {
    sheetNames: workbook.SheetNames,
    sheets: sheetsData
  };
}
