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
        padding: var(--space-6) var(--space-4);
        margin-top: auto;
      }

      .footer-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        text-align: center;
      }

      .footer-info {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }

      .copyright {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0;
      }

      .tagline {
        font-size: var(--font-size-xs);
        color: var(--color-text-disabled);
        margin: 0;
      }

      .footer-links {
        display: flex;
        gap: var(--space-6);
      }

      .footer-link {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        text-decoration: none;
        transition: color var(--transition-fast);
      }

      .footer-link:hover {
        color: var(--color-primary);
      }

      @media (max-width: 480px) {
        .footer-links {
          flex-direction: column;
          gap: var(--space-3);
        }
      }
    `,
  ],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
