// src/types/pdfjs-dist.d.ts
declare module "pdfjs-dist/build/pdf.mjs" {
  export interface TextItem { str: string }
  export interface TextContent { items: TextItem[] }
  export interface PDFPageProxy { getTextContent(): Promise<TextContent> }
  export interface PDFDocumentProxy {
    numPages: number
    getPage(n: number): Promise<PDFPageProxy>
  }
  export function getDocument(params: any): { promise: Promise<PDFDocumentProxy> }
  export const GlobalWorkerOptions: { workerSrc?: string }
}
