import { Directive, Input, ElementRef} from '@angular/core';
import MarkdownIt from 'markdown-it';
import * as MarkdownItFootnote from 'markdown-it-footnote';
import * as MarkdownItTexmath from 'markdown-it-texmath';
import * as Katex from 'katex';

@Directive({
  selector: '[appMarkdownRenderer]'
})
export class MarkdownRendererDirective {

  @Input('data') set data(data: string) {
    if (this.input !== data) {
      this.input = data;
      this.render();
    }
  }

  private input: string;
  private node: HTMLElement;
  private markdownIt: any;

  constructor(private element: ElementRef) {
    this.node = element.nativeElement as HTMLElement;
    this.markdownIt = MarkdownIt({
      html:         false,        // Enable HTML tags in source
      xhtmlOut:     false,        // Use '/' to close single tags (<br />).
                                  // This is only for full CommonMark compatibility.
      breaks:       true,        // Convert '\n' in paragraphs into <br>
      langPrefix:   'language-',  // CSS language prefix for fenced blocks. Can be
                                  // useful for external highlighters.
      linkify:      false,        // Autoconvert URL-like text to links

      // Enable some language-neutral replacement + quotes beautification
      typographer:  false,

      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: '“”‘’',

      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externally.
      // If result starts with <pre... internal wrapper is skipped.
      highlight: function (/*str, lang*/) { return ''; }
    });

    this.markdownIt.use(MarkdownItFootnote);
    this.markdownIt.use(MarkdownItTexmath, {
      engine: Katex,
      delimiters: 'dollars',
      katexOptions: {
        macros: {
          '\\RR': '\\mathbb{R}'
        }
      }
    });
  }

  private render() {
    if (this.input && this.input.length) {
      this.node.innerHTML = this.markdownIt.render(this.input);
      this.hookHrefDOM();
    } else {
      this.node.textContent = '';
    }
  }

  hookHrefDOM() {

    const allHref = this.element.nativeElement.querySelectorAll('a');
    allHref.forEach(element => {
      element.addEventListener('click', this.onClick.bind(this));
    });
  }

  onClick(event) {
    event.preventDefault();
    const element = document.getElementById(event.target.hash.replace('#', ''));
    element.scrollIntoView();
  }
}
