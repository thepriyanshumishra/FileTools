import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export async function addWatermark(
  pdfBytes: ArrayBuffer,
  watermarkText: string,
  options: { opacity?: number; fontSize?: number; rotation?: number } = {}
): Promise<Uint8Array> {
  const { opacity = 0.3, fontSize = 48, rotation = 45 } = options;
  
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const page of pages) {
    const { width, height } = page.getSize();
    
    page.drawText(watermarkText, {
      x: width / 2 - (watermarkText.length * fontSize) / 4,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(rotation),
    });
  }

  return await pdfDoc.save();
}

export async function addPageNumbers(
  pdfBytes: ArrayBuffer,
  options: { position?: 'bottom-center' | 'bottom-right' | 'bottom-left'; startFrom?: number } = {}
): Promise<Uint8Array> {
  const { position = 'bottom-center', startFrom = 1 } = options;
  
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNumber = `${index + startFrom}`;
    
    let x = width / 2 - 10;
    if (position === 'bottom-right') x = width - 50;
    if (position === 'bottom-left') x = 30;

    page.drawText(pageNumber, {
      x,
      y: 30,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  });

  return await pdfDoc.save();
}

export async function extractPages(
  pdfBytes: ArrayBuffer,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const newPdf = await PDFDocument.create();

  for (const pageNum of pageNumbers) {
    if (pageNum > 0 && pageNum <= pdfDoc.getPageCount()) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
      newPdf.addPage(copiedPage);
    }
  }

  return await newPdf.save();
}

export async function reorderPages(
  pdfBytes: ArrayBuffer,
  newOrder: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const newPdf = await PDFDocument.create();

  for (const pageNum of newOrder) {
    if (pageNum > 0 && pageNum <= pdfDoc.getPageCount()) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
      newPdf.addPage(copiedPage);
    }
  }

  return await newPdf.save();
}

export async function getPdfInfo(pdfBytes: ArrayBuffer): Promise<{
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle(),
    author: pdfDoc.getAuthor(),
    subject: pdfDoc.getSubject(),
    creator: pdfDoc.getCreator(),
    producer: pdfDoc.getProducer(),
    creationDate: pdfDoc.getCreationDate(),
    modificationDate: pdfDoc.getModificationDate(),
  };
}

export async function removePage(
  pdfBytes: ArrayBuffer,
  pageNumber: number
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  if (pageNumber > 0 && pageNumber <= pdfDoc.getPageCount()) {
    pdfDoc.removePage(pageNumber - 1);
  }

  return await pdfDoc.save();
}

export async function duplicatePage(
  pdfBytes: ArrayBuffer,
  pageNumber: number
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  if (pageNumber > 0 && pageNumber <= pdfDoc.getPageCount()) {
    const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
    pdfDoc.insertPage(pageNumber, copiedPage);
  }

  return await pdfDoc.save();
}
