import { Buffer } from 'buffer';

export interface PDFProcessingResult {
  success: boolean;
  text?: string;
  pageCount?: number;
  error?: string;
}

export class PDFProcessor {
  /**
   * Validates if a buffer contains a valid PDF file
   */
  static validatePDFBuffer(buffer: Buffer): { isValid: boolean; error?: string } {
    if (!buffer || buffer.length === 0) {
      return { isValid: false, error: 'Buffer is empty' };
    }

    if (buffer.length < 100) {
      return { isValid: false, error: 'File too small to be a valid PDF' };
    }

    // Check PDF header
    const header = buffer.subarray(0, 4).toString('ascii');
    if (header !== '%PDF') {
      return { isValid: false, error: 'Invalid PDF header - file may be corrupted' };
    }

    return { isValid: true };
  }

  /**
   * Extracts text content from PDF buffer using simple parsing
   */
  static async extractText(buffer: Buffer): Promise<PDFProcessingResult> {
    try {
      // Validate buffer first
      const validation = this.validatePDFBuffer(buffer);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Convert buffer to string for text extraction
      const pdfText = buffer.toString('latin1');
      
      // Extract text using multiple methods
      let extractedText = '';
      
      // Method 1: Extract text between parentheses (most common PDF text format)
      const parenthesesMatches = pdfText.match(/\(([^)]*)\)/g);
      if (parenthesesMatches) {
        const parenthesesText = parenthesesMatches
          .map(match => match.slice(1, -1)) // Remove parentheses
          .filter(text => text.length > 1 && /[a-zA-Z0-9]/.test(text))
          .join(' ');
        extractedText += parenthesesText + ' ';
      }

      // Method 2: Extract text between square brackets
      const bracketMatches = pdfText.match(/\[([^\]]*)\]/g);
      if (bracketMatches) {
        const bracketText = bracketMatches
          .map(match => match.slice(1, -1)) // Remove brackets
          .filter(text => text.length > 1 && /[a-zA-Z0-9]/.test(text))
          .join(' ');
        extractedText += bracketText + ' ';
      }

      // Method 3: Extract text from stream objects
      const streamMatches = pdfText.match(/stream\s*([\s\S]*?)\s*endstream/g);
      if (streamMatches) {
        streamMatches.forEach(stream => {
          const streamContent = stream.replace(/^stream\s*/, '').replace(/\s*endstream$/, '');
          // Look for readable text in streams
          const readableText = streamContent.match(/[a-zA-Z][a-zA-Z0-9\s.,!?;:'"()-]{3,}/g);
          if (readableText) {
            extractedText += readableText.join(' ') + ' ';
          }
        });
      }

      // Clean up extracted text
      extractedText = extractedText
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\x20-\x7E]/g, ' ') // Remove non-printable characters
        .trim();

      // Estimate page count (rough approximation)
      const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g);
      const pageCount = pageMatches ? pageMatches.length : 1;

      if (!extractedText) {
        extractedText = 'PDF processed successfully but no readable text could be extracted. This may be a scanned document or contain only images.';
      }

      return {
        success: true,
        text: extractedText,
        pageCount
      };

    } catch (error: any) {
      console.error('PDF processing error:', error);
      
      return {
        success: false,
        error: 'Failed to extract text from PDF file'
      };
    }
  }

  /**
   * Quick check if buffer might contain file path instead of file content
   */
  static detectFilePath(buffer: Buffer): boolean {
    if (buffer.length > 1000) return false;
    
    try {
      const content = buffer.toString('utf8');
      return content.includes('./test/') || 
             content.includes('.pdf') || 
             content.startsWith('/') ||
             content.includes('\\');
    } catch {
      return false;
    }
  }
}
