import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';

export async function formatCode(code: string, language: string): Promise<string> {
  const languages: Record<string, any> = {
    javascript: { indent: 2, semi: true },
    typescript: { indent: 2, semi: true },
    python: { indent: 4, semi: false },
    java: { indent: 4, semi: true },
    css: { indent: 2, semi: true },
    json: { indent: 2, semi: false },
  };

  const config = languages[language.toLowerCase()] || { indent: 2, semi: true };
  
  try {
    const lines = code.split('\n');
    let formatted = '';
    let indentLevel = 0;
    const indentStr = ' '.repeat(config.indent);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.endsWith('{')) {
        formatted += indentStr.repeat(indentLevel) + trimmed + '\n';
        indentLevel++;
      } else if (trimmed.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += indentStr.repeat(indentLevel) + trimmed + '\n';
      } else {
        formatted += indentStr.repeat(indentLevel) + trimmed + '\n';
      }
    }

    return formatted;
  } catch (error) {
    return code;
  }
}

export async function minifyCode(code: string, language: string): Promise<string> {
  return code
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('//'))
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}();,:])\s*/g, '$1');
}

export async function highlightCode(code: string, language: string): Promise<string> {
  try {
    const grammar = Prism.languages[language.toLowerCase()];
    if (!grammar) return code;
    return Prism.highlight(code, grammar, language.toLowerCase());
  } catch (error) {
    return code;
  }
}

export async function codeToImage(code: string, language: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const lines = code.split('\n');
  const lineHeight = 20;
  const padding = 20;
  const maxWidth = 800;

  canvas.width = maxWidth;
  canvas.height = lines.length * lineHeight + padding * 2;

  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '14px "Fira Code", monospace';
  ctx.fillStyle = '#d4d4d4';

  lines.forEach((line, i) => {
    ctx.fillText(line, padding, padding + (i + 1) * lineHeight);
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export async function diffCode(code1: string, code2: string): Promise<string> {
  const lines1 = code1.split('\n');
  const lines2 = code2.split('\n');
  let diff = '';

  const maxLen = Math.max(lines1.length, lines2.length);
  
  for (let i = 0; i < maxLen; i++) {
    const line1 = lines1[i] || '';
    const line2 = lines2[i] || '';

    if (line1 === line2) {
      diff += `  ${line1}\n`;
    } else {
      if (line1) diff += `- ${line1}\n`;
      if (line2) diff += `+ ${line2}\n`;
    }
  }

  return diff;
}

export function testRegex(pattern: string, text: string, flags: string = 'g'): {
  matches: string[];
  count: number;
  valid: boolean;
  error?: string;
} {
  try {
    const regex = new RegExp(pattern, flags);
    const matches = text.match(regex) || [];
    return {
      matches,
      count: matches.length,
      valid: true,
    };
  } catch (error) {
    return {
      matches: [],
      count: 0,
      valid: false,
      error: (error as Error).message,
    };
  }
}
