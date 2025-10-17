import { PDFDocument, degrees } from 'pdf-lib';

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
  const pdfBytes = await pdf.save({ useObjectStreams: false });
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
