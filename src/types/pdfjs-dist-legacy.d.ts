// src/types/pdfjs-dist-legacy.d.ts
declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export interface TextItem { str: string }
  export interface TextContent { items: TextItem[] }
  export interface PDFPageProxy { getTextContent(): Promise<TextContent> }
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(n: number): Promise<PDFPageProxy>;
  }
  export function getDocument(params: any): { promise: Promise<PDFDocumentProxy> }
  export const GlobalWorkerOptions: { workerSrc?: string }
}
