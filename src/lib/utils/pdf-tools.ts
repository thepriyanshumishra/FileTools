import { PDFDocument, degrees } from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt';

export async function mergePDFs(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

export async function splitPDF(file: File, pageRanges: number[][]): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const results: Blob[] = [];
  
  for (const range of pageRanges) {
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, range);
    pages.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    results.push(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }));
  }
  
  return results;
}

export async function rotatePDFPages(file: File, rotation: number): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();
  
  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotation));
  });
  
  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

export async function removePDFPages(file: File, pageIndices: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  pageIndices.sort((a, b) => b - a).forEach((index) => {
    pdf.removePage(index);
  });
  
  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

export async function extractPDFPages(file: File, pageIndices: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  const pages = await newPdf.copyPages(pdf, pageIndices);
  pages.forEach((page) => newPdf.addPage(page));
  
  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

export async function getPDFInfo(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  
  return {
    pageCount: pdf.getPageCount(),
    title: pdf.getTitle(),
    author: pdf.getAuthor(),
    subject: pdf.getSubject(),
    creator: pdf.getCreator(),
    producer: pdf.getProducer(),
  };
}

export async function compressPDF(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pdfBytes = await pdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

export async function organizePDFPages(file: File, pageOrder: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  for (const pageIndex of pageOrder) {
    const [page] = await newPdf.copyPages(pdf, [pageIndex]);
    newPdf.addPage(page);
  }
  
  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

export async function extractImagesFromPDF(file: File): Promise<Blob[]> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const imageBlobs: Blob[] = [];
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const opList = await page.getOperatorList();
    
    for (let j = 0; j < opList.fnArray.length; j++) {
      const fn = opList.fnArray[j];
      // OPS.paintImageXObject = 82, OPS.paintInlineImageXObject = 83
      if (fn === 82 || fn === 83) {
        const imgKey = opList.argsArray[j][0];
        const img = page.objs.get(imgKey);
        if (img && img.width && img.height && img.data) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          
          const imgData = ctx.createImageData(img.width, img.height);
          if (img.data.length === img.width * img.height * 3) {
            for (let k = 0, l = 0; k < img.data.length; k += 3, l += 4) {
              imgData.data[l] = img.data[k];
              imgData.data[l+1] = img.data[k+1];
              imgData.data[l+2] = img.data[k+2];
              imgData.data[l+3] = 255;
            }
          } else {
            imgData.data.set(img.data);
          }
          
          ctx.putImageData(imgData, 0, 0);
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/png');
          });
          if (blob) imageBlobs.push(blob);
        }
      }
    }
  }
  
  if (imageBlobs.length === 0) {
    const fallbackImages = await pdfToImages(file);
    imageBlobs.push(...fallbackImages);
  }
  
  return imageBlobs;
}

export async function extractTextFromPDF(file: File): Promise<Blob> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || "")
      .join(" ");
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }
  
  return new Blob([fullText], { type: 'text/plain;charset=utf-8' });
}

export async function addWatermarkToPDF(file: File, text: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 2 - 50,
      y: height / 2,
      size: 50,
      opacity: 0.3,
    });
  }
  
  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

export async function protectPDF(file: File, password: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);
  const encryptedBytes = await encryptPDF(pdfBytes, password);
  return new Blob([encryptedBytes as BlobPart], { type: 'application/pdf' });
}

export async function unlockPDF(file: File, password: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);
  const decryptedBytes = await decryptPDF(pdfBytes, password);
  return new Blob([decryptedBytes as BlobPart], { type: 'application/pdf' });
}

export async function pdfToImages(file: File): Promise<Blob[]> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const imageBlobs: Blob[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) continue;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    }).promise;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95);
    });

    if (blob) {
      imageBlobs.push(blob);
    }
  }

  return imageBlobs;
}

export async function pdfToWord(file: File): Promise<Blob> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1 { color: #333333; text-align: center; }
        p { margin-bottom: 12px; text-align: justify; }
        .page-break { page-break-after: always; border-top: 1px dashed #cccccc; margin: 20px 0; padding-top: 10px; color: #888888; font-size: 11px; }
      </style>
    </head>
    <body>
      <h1>${file.name.replace(/\.[^/.]+$/, "")}</h1>
  `;
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || "")
      .join(" ");
    
    const paragraphs = pageText.split("  ").filter(p => p.trim().length > 0);
    for (const p of paragraphs) {
      htmlContent += `<p>${p.trim()}</p>`;
    }
    
    if (i < pdf.numPages) {
      htmlContent += `<div class="page-break">Page ${i} End</div>`;
    }
  }
  
  htmlContent += `
    </body>
    </html>
  `;
  
  return new Blob([htmlContent], { type: 'application/msword' });
}

export async function pdfToExcel(file: File): Promise<Blob> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let csvContent = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    const items = textContent.items as any[];
    const rowsMap: Record<number, any[]> = {};
    
    items.forEach((item) => {
      const y = Math.round(item.transform[5]);
      if (!rowsMap[y]) {
        rowsMap[y] = [];
      }
      rowsMap[y].push(item);
    });
    
    const sortedY = Object.keys(rowsMap)
      .map(Number)
      .sort((a, b) => b - a);
      
    csvContent += `Page ${i}\n`;
    
    sortedY.forEach((y) => {
      const rowItems = rowsMap[y].sort((a, b) => a.transform[4] - b.transform[4]);
      
      let rowCells: string[] = [];
      let currentCell = "";
      let lastX = -1;
      
      rowItems.forEach((item) => {
        const x = item.transform[4];
        if (lastX !== -1 && x - lastX > 15) {
          rowCells.push(currentCell.trim());
          currentCell = "";
        }
        currentCell += item.str + " ";
        lastX = x + item.width;
      });
      
      if (currentCell) {
        rowCells.push(currentCell.trim());
      }
      
      const csvRow = rowCells
        .map(cell => `"${cell.replace(/"/g, '""')}"`)
        .join(",");
        
      if (csvRow.replace(/,/g, '').trim().length > 0) {
        csvContent += csvRow + "\n";
      }
    });
    
    csvContent += "\n";
  }
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
}
