import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stripHtml', standalone: true, pure: true })
export class StripHtmlPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    // Use regex to strip HTML tags — avoids XSS risk of innerHTML parsing
    return value.replace(/<[^>]*>/g, '');
  }
}
