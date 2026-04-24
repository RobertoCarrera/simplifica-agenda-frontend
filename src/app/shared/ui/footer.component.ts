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
        padding: 1rem;
        margin-top: auto;
      }

      .footer-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        text-align: center;
      }

      .footer-info { display: flex; flex-direction: column; gap: 0.125rem; }

      .copyright { 
        font-size: 0.875rem;
        margin: 0;
        color: var(--color-text-secondary);
      }

      .tagline { 
        font-size: 0.75rem;
        margin: 0;
        color: var(--color-text-disabled);
      }

      .footer-links { display: flex; gap: 1.5rem; }

      .footer-link {
        font-size: 0.875rem;
        text-decoration: none;
        transition: color 150ms ease;
        color: var(--color-text-secondary);
      }
      .footer-link:hover { color: var(--color-primary); }

      @media (max-width: 480px) {
        .footer-links { flex-direction: column; gap: 0.75rem; }
      }
    `,
  ],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
