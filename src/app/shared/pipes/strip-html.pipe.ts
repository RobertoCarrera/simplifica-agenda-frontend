import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stripHtml', standalone: true, pure: true })
export class StripHtmlPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    const div = document.createElement('div');
    div.innerHTML = value;
    return div.textContent ?? div.innerText ?? '';
  }
}
