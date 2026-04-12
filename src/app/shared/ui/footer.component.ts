import { Component } from "@angular/core";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-info">
          <p class="copyright">
            © {{ currentYear }} Simplifica CRM.
            {{ "footer.rights" | transloco }}
          </p>
          <p class="tagline">{{ "footer.tagline" | transloco }}</p>
        </div>

        <div class="footer-links">
          <a href="#" class="footer-link">{{ "footer.privacy" | transloco }}</a>
          <a href="#" class="footer-link">{{ "footer.terms" | transloco }}</a>
          <a href="#" class="footer-link">{{ "footer.contact" | transloco }}</a>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .site-footer {
        @apply bg-slate-50 border-t border-slate-200 px-4 py-6 mt-auto;
      }

      .footer-container {
        @apply max-w-[1200px] mx-auto flex flex-col items-center gap-4 text-center;
      }

      .footer-info { @apply flex flex-col gap-0.5; }

      .copyright { @apply text-sm text-secondary m-0; }

      .tagline { @apply text-xs text-slate-400 m-0; }

      .footer-links { @apply flex gap-6; }

      .footer-link {
        @apply text-sm text-secondary no-underline transition-colors duration-150;
        &:hover { @apply text-primary; }
      }

      @media (max-width: 480px) {
        .footer-links { @apply flex-col gap-3; }
      }
    `,
  ],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
