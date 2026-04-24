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
        background: var(--color-surface);
        border-top: 1px solid var(--color-border);
        @apply px-4 py-6 mt-auto;
      }

      .footer-container {
        @apply max-w-[1200px] mx-auto flex flex-col items-center gap-4 text-center;
      }

      .footer-info { @apply flex flex-col gap-0.5; }

      .copyright { 
        @apply text-sm m-0; 
        color: var(--color-text-secondary);
      }

      .tagline { 
        @apply text-xs m-0; 
        color: var(--color-text-disabled);
      }

      .footer-links { @apply flex gap-6; }

      .footer-link {
        @apply text-sm no-underline transition-colors duration-150;
        color: var(--color-text-secondary);
        &:hover { color: var(--color-primary); }
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
