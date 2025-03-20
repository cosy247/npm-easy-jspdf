import { jsPDF } from 'jspdf';
import '../fonts/a-normal.js';

export default class EasyPDF {
  #pdf = new jsPDF();
  /* 当前页码 */
  #pageIndex = 1;
  /* 当前写入的y位置 */
  #writeY = 0;
  /* 当前写入的x位置 */
  #writeX = 0;
  /* 最后一行的高度 */
  #lastLineHeight = 0;

  /* 默认 A4 页面宽度（单位：毫米）*/
  pageWidth = 0;
  /* 默认 A4 页面高度（单位：毫米）*/
  pageHeight = 0;
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
    this.pageWidth = this.#pdf.internal.pageSize.getWidth();
    this.pageHeight = this.#pdf.internal.pageSize.getHeight();
    this.#pdf.setFont('a');
    this.#writeY = this.pagePaddingY;
    this.#writeX = this.pagePaddingX;
  }

  #checkWriteY(height) {
    if (this.#writeY + height > this.pageHeight - this.pagePaddingY) {
      this.#pdf.addPage();
      this.#pdf.setPage(++this.#pageIndex);
      this.#writeY = this.pagePaddingY;
      return false;
    }
    return true;
  }

  #getLineHeight(fontSize) {
    return fontSize * 0.55;
  }

  #getTextWriteY(fontSize) {
    return this.#writeY + fontSize * 0.4;
  }

  #getTextWidth(text) {
    return this.#pdf.getTextWidth(text);
  }

  /**
   * 向 PDF 文档添加文本。
   *
   * @param {string} text - 要添加的文本。
   * @param {Object} [options] - 文本的可选设置。
   * @param {number} [options.fontSize] - 文本的字体大小。
   * @param {[number, number, number, ?number]} [options.color] - 文本的 RGB(A) 颜色格式。
   * @param {number} [options.left] - 文本的左边距。
   * @param {number} [options.right] - 文本的右边距。
   * @param {boolean} [options.article] - 是否将文本视为段落模式。
   * @returns {this} 当前对象的实例，以便链式调用。
   */
  addText(text, options = {}) {
    options = {
      fontSize: this.fontSize,
      color: this.color,
      left: 0,
      right: 0,
      article: false,
      ...options,
    };
    this.#pdf.setFontSize(options.fontSize);
    this.#pdf.setTextColor(...options.color);
    const lineHeight = this.#getLineHeight(options.fontSize);
    // 是否为段落模式
    if (options.article && this.#writeX !== this.pagePaddingX) {
      this.#writeX = this.pagePaddingX;
      this.#writeY += this.#lastLineHeight;
    }
    // 当前行剩余宽度
    const remainWidth = this.clientWidth - this.#writeX - options.left - this.pagePaddingX;
    // 分隔第一行
    let firstLine = '';
    let firstWidth = 0;
    for (const c of text) {
      const width = this.#getTextWidth(firstLine + c);
      if (width > remainWidth) break;
      firstWidth = width;
      firstLine += c;
    }
    // 写入第一行
    this.#checkWriteY(lineHeight);
    this.#pdf.text(firstLine, this.#writeX, this.#getTextWriteY(options.fontSize));
    this.#writeX += firstWidth;
    // 分隔剩下的文本行
    if (firstLine.length !== text.length) {
      const splitText = this.#pdf.splitTextToSize(text.slice(firstLine.length), this.clientWidth);
      for (let index = 0; index < splitText.length; index++) {
        const text = splitText[index];
        this.#writeY += lineHeight;
        this.#writeX = this.pagePaddingX;
        this.#checkWriteY(lineHeight);
        this.#pdf.text(text, this.#writeX, this.#getTextWriteY(options.fontSize));
        console.log(text, this.#writeX, this.#getTextWriteY(options.fontSize));
        // 最后一行记录x值
        if (index === splitText.length - 1) {
          this.#writeX = this.pagePaddingX + this.#getTextWidth(text);
        }
      }
    }
    // 添加右边距
    this.#writeX += options.right;
    if (this.#writeX > this.clientWidth + this.#pageIndex) {
      this.#writeX = this.pagePaddingX;
      this.#checkWriteY(lineHeight);
      this.#writeY += lineHeight;
    }
    // 记录最后一行的高度
    this.#lastLineHeight = lineHeight;
    return this;
  }

  /**
   * 向文档添加一篇文章。
   *
   * @param {string} text - 要添加的文本。
   * @param {Object} [options] - 文本的可选设置。
   * @param {number} [options.fontSize] - 文本的字体大小。
   * @param {[number, number, number, ?number]} [options.color] - 文本的 RGB(A) 颜色格式。
   * @param {number} [options.left] - 文本的左边距。
   * @param {number} [options.right] - 文本的右边距。
   * @returns {this} 当前对象的实例，以便链式调用。
   */
  addArticle(text, options = {}) {
    return this.addText(text, { ...options, article: true });
  }

  /**
   * 向 PDF 文档添加一条水平线。
   *
   * @param {Object} [options] - 线条的配置选项。
   * @param {number} [options.top] - 线条的上边距。
   * @param {number} [options.bottom] - 线条的下边距。
   * @param {number} [options.lineWidth] - 线条的宽度。
   * @param {[number, number, number, ?number]} [options.color] - 线条的 RGB(A) 颜色格式。
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
    if (this.#writeX !== this.pagePaddingX) {
      this.#writeX = this.pagePaddingX;
      this.#writeY += this.#lastLineHeight;
    }
    this.#checkWriteY(options.top + options.lineWidth);
    this.#pdf.setLineWidth(options.lineWidth);
    this.#pdf.setDrawColor(...options.color);
    this.#pdf.line(
      this.pagePaddingX,
      this.#writeY + options.top,
      this.pageWidth - this.pagePaddingX,
      this.#writeY + options.top
    );
    this.#writeY += options.top + options.lineWidth + options.bottom;
    return this;
  }

  /**
   * 添加空白区域。
   *
   * @param {number} [height] - 要添加的空白高度。
   * @returns {this} 当前实例，以便链式调用。
   * @private
   */
  addSpace(height = 5) {
    if(this.#writeX !== this.pagePaddingX) {
      this.#writeX = this.pagePaddingX;
      this.#writeY += this.#lastLineHeight;
    }
    this.#checkWriteY(height);
    this.#writeY += height;
    this.#writeX = this.pagePaddingX;
    return this;
  }

  save(filename) {
    this.#pdf.save(filename);
    return this;
  }
}
