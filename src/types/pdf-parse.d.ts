// Tipos básicos para pdf-parse

declare module "pdf-parse" {
  export interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata?: any;
    text: string;
    version: string;
  }

  export type Pagerender = (pageData: any) => Promise<string> | string;

  export interface PdfParseOptions {
    pagerender?: Pagerender;
    max?: number; // 0 = todas
  }

  function pdfParse(
    data: Buffer | Uint8Array | ArrayBuffer,
    options?: PdfParseOptions
  ): Promise<PdfParseResult>;

  export = pdfParse; // CJS export
}

// Declaración para el build CJS que estamos importando
declare module "pdf-parse/lib/pdf-parse.js" {
  import pdfParse = require("pdf-parse");
  export default pdfParse; // default export para `import { default: pdfParse }`
}
