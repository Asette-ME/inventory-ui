export interface ExtractedRow {
  id: string;
  milestone: string;
  percentage: string;
  date: string;
  amount: string;
  originalText?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'magic';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ProgressBarProps {
  progress: number;
  status: string;
}

export interface TesseractWord {
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  text: string;
}

export interface TesseractLine {
  text: string;
}

export interface TesseractResult {
  data: {
    text: string;
    words: TesseractWord[];
    lines: TesseractLine[];
  };
}

export interface TesseractLoggerMessage {
  status: string;
  progress: number;
}

export interface TesseractWorker {
  recognize: (file: File) => Promise<TesseractResult>;
  terminate: () => Promise<void>;
}

declare global {
  interface Window {
    Tesseract?: {
      createWorker: (
        lang: string,
        oem: number,
        options: { logger: (m: TesseractLoggerMessage) => void },
      ) => Promise<TesseractWorker>;
    };
    pdfjsLib?: {
      GlobalWorkerOptions: {
        workerSrc: string;
      };
      getDocument: (data: ArrayBuffer) => {
        promise: Promise<PDFDocument>;
      };
    };
  }
}

export interface PDFDocument {
  getPage: (pageNumber: number) => Promise<PDFPage>;
}

export interface PDFPage {
  getViewport: (options: { scale: number }) => PDFViewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PDFViewport }) => { promise: Promise<void> };
}

export interface PDFViewport {
  width: number;
  height: number;
}

export interface ParsedAIRow {
  milestone: string;
  percentage: string;
  date: string;
  amount: string;
}
