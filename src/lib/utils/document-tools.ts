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
