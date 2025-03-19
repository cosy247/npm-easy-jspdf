import { jsPDF } from 'jspdf';
import '../fonts/a-normal.js';

export default class EasyPDF {
  #pdf = null;
  /* 当前页码 */
  #pageIndex = 1;
  /* 当前写入的y位置 */
  #writeY = 0;
  /* 当前写入的x位置 */
  #writeX = 0;

  /* 默认 A4 页面宽度（单位：毫米）*/
  pageWidth = 210;
  /* 默认 A4 页面高度（单位：毫米）*/
  pageHeight = 297;
  /* 页面左右边距*/
  pagePaddingX = 10;
  /* 页面上下边距*/
  pagePaddingY = 10;
  /* 字体大小*/
  fontSize = 16;
  /* 字体名称*/
  fontName = 'a';
  /* 颜色*/
  color = [10, 10, 10];

  /* 内容区宽度 */
  get clientWidth() {
    return this.pageWidth - this.pagePaddingX * 2;
  }
  /* 内容区高度 */
  get clientHeight() {
    return this.pageHeight - this.pagePaddingY * 2;
  }

  constructor() {
    this.#pdf = new jsPDF();
    this.#pdf.setFont('a');
    this.#writeY = this.pagePaddingY;
    this.#writeX = this.pagePaddingX;
  }

  #checkWriteY(height) {
    if (this.#writeY + height > this.pageHeight - this.pagePaddingY) {
      this.#pdf.addPage();
      this.#pdf.setPage(++this.#pageIndex);
      this.#writeY = this.pagePaddingY;
    }
  }

  /**
   * 将文本添加到 PDF 文档中。
   *
   * @param {string} text - 要添加到 PDF 的文本。
   * @param {Object} [options={}] - 文本的可选设置。
   * @param {number} [options.fontSize] - 文本的字体大小。
   * @param {[number, number, number]} [options.color] - 文本的 RGB 颜色格式。
   * @returns {this} 当前实例，以便链式调用。
   */
  addText(text, options = {}) {
    options = {
      fontSize: this.fontSize,
      color: this.color,
      ...options,
    };
    this.#pdf.setLineWidth(0.5);
    const fontSize = options.fontSize || this.fontSize;
    const lineHeight = fontSize * 0.55;
    this.#pdf.setFontSize(fontSize);
    this.#pdf.setTextColor(...options.color);
    const splitText = this.#pdf.splitTextToSize(text, this.clientWidth); // 180 是每行的最大宽度
    for (const text of splitText) {
      this.#checkWriteY(lineHeight);
      this.#pdf.text(text, this.#writeX, this.#writeY + fontSize * 0.4);
      this.#writeY += lineHeight;

      (doc.getStringUnitWidth(text) * fontSize) / 1000;
    }
    return this;
  }

  /**
   * 向 PDF 文档添加一条水平线。
   *
   * @param {Object} [options={}] - 线条的配置选项。
   * @param {number} [options.top] - 线条的上边距。
   * @param {number} [options.bottom] - 线条的下边距。
   * @param {number} [options.lineWidth] - 线条的宽度。
   * @param {[number, number, number]} [options.color] - 线条的 RGB 颜色格式。
   * @returns {this} 当前实例，以便链式调用。
   */
  addLine(options = {}) {
    options = {
      top: 4,
      bottom: 4,
      lineWidth: 0.5,
      color: this.color,
      ...options,
    };
    this.#checkWriteY(options.top + options.lineWidth);
    this.#pdf.setLineWidth(options.lineWidth);
    this.#pdf.setDrawColor(...options.color);
    this.#pdf.line(this.pagePaddingX, this.#writeY + options.top, this.pageWidth - this.pagePaddingX, this.#writeY + options.top);
    this.#writeY += options.top + options.lineWidth + options.bottom;
    return this;
  }

  save(filename) {
    this.#pdf.save(filename);
    return this;
  }
}
