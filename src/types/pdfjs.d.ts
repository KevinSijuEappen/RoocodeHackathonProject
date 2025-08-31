declare module 'pdfjs-dist' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
    destroy(): Promise<void>;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface TextContent {
    items: TextItem[];
  }

  export interface TextItem {
    str: string;
    dir: string;
    width: number;
    height: number;
    transform: number[];
    fontName: string;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export interface GetDocumentOptions {
    data: Uint8Array | ArrayBuffer;
    useSystemFonts?: boolean;
    disableFontFace?: boolean;
    verbosity?: number;
    isEvalSupported?: boolean;
    useWorkerFetch?: boolean;
    disableAutoFetch?: boolean;
    disableStream?: boolean;
  }

  export interface WorkerOptions {
    workerSrc: string | null;
  }

  export function getDocument(options: GetDocumentOptions): PDFDocumentLoadingTask;

  export const GlobalWorkerOptions: WorkerOptions;
}
