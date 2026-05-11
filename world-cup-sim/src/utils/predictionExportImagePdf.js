import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/** PNG/JPG exports: sharper on screen */
const SCREEN_CAPTURE_SCALE = 2;

/** PDF: smaller canvas + JPEG slices = much smaller files and lower peak memory */
const PDF_CAPTURE_SCALE = 1.35;
const PDF_MAX_CANVAS_WIDTH = 2000;
const PDF_JPEG_QUALITY = 0.82;

export async function renderExportElementToCanvas(element, options = {}) {
  const { scale = SCREEN_CAPTURE_SCALE, backgroundColor = '#0a1a2a' } = options;
  return html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  });
}

/** Resize width (preserving aspect) before PDF encode; reduces pixels and memory */
function downscaleCanvasMaxWidth(canvas, maxWidth) {
  if (!canvas || canvas.width <= maxWidth) return canvas;
  const scale = maxWidth / canvas.width;
  const w = Math.round(maxWidth);
  const h = Math.round(canvas.height * scale);
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  ctx.fillStyle = '#0a1a2a';
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, w, h);
  return out;
}

/**
 * One JPEG per page (vertical strip of the image). Avoids embedding the same
 * full-height PNG on every page, which blew up file size and memory.
 */
function addCanvasToPdfAsJpegPages(pdf, canvas, jpegQuality) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const cw = canvas.width;
  const ch = canvas.height;
  const totalImgH = (ch * pageW) / cw;

  if (totalImgH <= pageH + 0.5) {
    const imgData = canvas.toDataURL('image/jpeg', jpegQuality);
    pdf.addImage(imgData, 'JPEG', 0, 0, pageW, totalImgH);
    return;
  }

  let yPt = 0;
  let first = true;
  while (yPt < totalImgH - 0.25) {
    if (!first) {
      pdf.addPage(undefined, 'landscape');
    }
    first = false;

    const sliceHPt = Math.min(pageH, totalImgH - yPt);
    const sy = (yPt / totalImgH) * ch;
    let sHeight = (sliceHPt / totalImgH) * ch;
    sHeight = Math.min(sHeight, Math.max(0, ch - sy));
    const stripH = Math.max(1, Math.ceil(sHeight));

    const strip = document.createElement('canvas');
    strip.width = cw;
    strip.height = stripH;
    const sctx = strip.getContext('2d');
    sctx.fillStyle = '#0a1a2a';
    sctx.fillRect(0, 0, cw, stripH);
    sctx.drawImage(canvas, 0, sy, cw, sHeight, 0, 0, cw, stripH);

    const imgData = strip.toDataURL('image/jpeg', jpegQuality);
    pdf.addImage(imgData, 'JPEG', 0, 0, pageW, sliceHPt);
    yPt += sliceHPt;
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Could not create image blob'));
        else resolve(blob);
      },
      type,
      quality
    );
  });
}

export async function downloadPngFromElement(element, filename) {
  const canvas = await renderExportElementToCanvas(element, { scale: SCREEN_CAPTURE_SCALE });
  const blob = await canvasToBlob(canvas, 'image/png');
  triggerDownload(blob, filename);
}

export async function downloadJpgFromElement(element, filename) {
  const canvas = await renderExportElementToCanvas(element, { scale: SCREEN_CAPTURE_SCALE });
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  triggerDownload(blob, filename);
}

export async function downloadPdfFromElement(element, filename) {
  const raw = await renderExportElementToCanvas(element, {
    scale: PDF_CAPTURE_SCALE,
    backgroundColor: '#0a1a2a'
  });
  const canvas = downscaleCanvasMaxWidth(raw, PDF_MAX_CANVAS_WIDTH);
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  addCanvasToPdfAsJpegPages(pdf, canvas, PDF_JPEG_QUALITY);
  pdf.save(filename);
}
