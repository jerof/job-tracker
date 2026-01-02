import puppeteer, { Browser, PDFOptions } from 'puppeteer';

// Configuration for PDF generation
const PDF_OPTIONS: PDFOptions = {
  format: 'A4',
  margin: {
    top: '1cm',
    right: '1cm',
    bottom: '1cm',
    left: '1cm',
  },
  printBackground: true,
  preferCSSPageSize: false,
};

// Browser launch options - optimized for serverless
const BROWSER_LAUNCH_OPTIONS = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--single-process', // Required for some serverless environments
  ],
};

// Singleton browser instance for reuse
let browserInstance: Browser | null = null;

/**
 * Get or create a browser instance
 * Reuses existing browser for better performance
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  try {
    browserInstance = await puppeteer.launch(BROWSER_LAUNCH_OPTIONS);
    return browserInstance;
  } catch (error) {
    console.error('Failed to launch browser:', error);
    throw new Error('Failed to initialize PDF generator');
  }
}

/**
 * Clean up browser instance
 * Call this when shutting down the server
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Generate a PDF from HTML content
 *
 * @param htmlContent - Complete HTML document to convert to PDF
 * @returns Buffer containing the PDF data
 */
export async function generatePDF(htmlContent: string): Promise<Buffer> {
  if (!htmlContent || htmlContent.trim().length === 0) {
    throw new Error('HTML content is required');
  }

  const browser = await getBrowser();
  let page = null;

  try {
    page = await browser.newPage();

    // Set viewport to A4-like dimensions
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
    });

    // Set the HTML content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000, // 30 second timeout
    });

    // Wait for any fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Generate PDF
    const pdfBuffer = await page.pdf(PDF_OPTIONS);

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (page) {
      await page.close().catch(() => {
        // Ignore errors closing page
      });
    }
  }
}

/**
 * Generate a PDF with custom options
 * Allows overriding default PDF settings
 */
export async function generatePDFWithOptions(
  htmlContent: string,
  options: Partial<PDFOptions>
): Promise<Buffer> {
  if (!htmlContent || htmlContent.trim().length === 0) {
    throw new Error('HTML content is required');
  }

  const browser = await getBrowser();
  let page = null;

  try {
    page = await browser.newPage();

    await page.setViewport({
      width: 794,
      height: 1123,
    });

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await page.evaluateHandle('document.fonts.ready');

    const mergedOptions: PDFOptions = {
      ...PDF_OPTIONS,
      ...options,
    };

    const pdfBuffer = await page.pdf(mergedOptions);

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

/**
 * Check if the PDF generator is available
 * Useful for health checks
 */
export async function isPDFGeneratorHealthy(): Promise<boolean> {
  try {
    const browser = await getBrowser();
    return browser.connected;
  } catch {
    return false;
  }
}
