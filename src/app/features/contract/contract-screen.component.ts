import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@jsverse/transloco";
import {
  BookingPublicService,
  Service,
  VariantPricing,
} from "../../services/booking-public.service";
import { applyBrandingColors } from "../../shared/branding.utils";
import { StripHtmlPipe } from "../../shared/pipes/strip-html.pipe";

/**
 * Placeholder "contratar" screen for the catalog-only portal mode.
 *
 * What this screen will own (next ticket, not in this commit):
 *   - A short client-info form (name, email, phone, company).
 *   - Either a Stripe checkout redirect (pago online) or a "leave contact
 *     info" form (solicitar info / contratar sin pago).
 *   - A success state that confirms receipt and shows next steps.
 *
 * For now it just acknowledges the chosen tier and shows a contact email,
 * so the customer isn't left at a 404. The data is loaded by serviceId
 * + variant_id queryParams and the chosen tier is highlighted.
 */
@Component({
  selector: "app-contract-screen",
  standalone: true,
  imports: [RouterLink, CommonModule, TranslocoModule, StripHtmlPipe],
  template: `
    <div class="contract-page">
      <a [routerLink]="['/', slug(), 'servicios']" class="back-link">
        ← Volver al catálogo
      </a>

      @if (loading()) {
        <div class="loading">Cargando servicio…</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else if (service()) {
        <header class="contract-header">
          <span class="service-dot" [style.background]="service()!.color || '#94a3b8'"></span>
          <div>
            <h1>{{ service()!.name }}</h1>
            @if (selectedTier(); as t) {
              <p class="tier-summary">
                <strong>{{ t.variantName }}</strong> ·
                <span class="tier-price">{{ t.basePrice }}€<span *ngIf="t.period"> / {{ periodLabel(t.period) }}</span></span>
              </p>
            }
          </div>
        </header>

        <section class="placeholder-card">
          <h2>Próximamente disponible</h2>
          <p>
            La contratación online de este servicio está en construcción. Si
            quieres contratar el plan <strong>{{ selectedTier()?.variantName || service()!.name }}</strong>,
            escríbenos a
            <a [attr.href]="'mailto:contacto@' + (companyDomain() || 'simplificacrm.es')">
              contacto&#64;{{ companyDomain() || 'simplificacrm.es' }}
            </a>
            y te enviaremos el contrato en menos de 24h.
          </p>
          @if (service()!.description) {
            <details class="description">
              <summary>Descripción del servicio</summary>
              <p>{{ service()!.description | stripHtml }}</p>
            </details>
          }
        </section>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .contract-page {
        max-width: 720px;
        margin: 0 auto;
        padding: 2rem 1rem 4rem;
      }
      .back-link {
        display: inline-block;
        color: var(--color-text-secondary);
        text-decoration: none;
        margin-bottom: 1.5rem;
        font-size: 0.875rem;
      }
      .back-link:hover { color: var(--color-text); }
      .contract-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .service-dot {
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        flex-shrink: 0;
        margin-top: 0.5rem;
      }
      .contract-header h1 {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0;
        color: var(--color-text);
      }
      .tier-summary {
        margin: 0.5rem 0 0;
        color: var(--color-text-secondary);
        font-size: 0.95rem;
      }
      .tier-price {
        color: var(--color-text);
        font-weight: 700;
      }
      .placeholder-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 0.75rem;
        padding: 1.75rem;
      }
      .placeholder-card h2 {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 0.75rem;
        color: var(--color-text);
      }
      .placeholder-card p {
        margin: 0;
        line-height: 1.55;
        color: var(--color-text-secondary);
      }
      .placeholder-card a {
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;
      }
      .placeholder-card a:hover { text-decoration: underline; }
      .description {
        margin-top: 1.25rem;
        border-top: 1px solid var(--color-border);
        padding-top: 1rem;
      }
      .description summary {
        cursor: pointer;
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        font-weight: 500;
      }
      .description p {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }
      .loading, .error {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--color-text-secondary);
      }
      .error { color: var(--color-error, #dc2626); }
    `,
  ],
})
export class ContractScreenComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingPublicService);

  slug = signal<string>("");
  service = signal<Service | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedTier = signal<{ variantName: string; basePrice: number; period: VariantPricing["billing_period"] | null } | null>(null);
  companyDomain = signal<string>("");

  ngOnInit() {
    const parentParams = this.route.parent?.snapshot.paramMap;
    const slug = parentParams?.get("slug") ?? this.route.snapshot.paramMap.get("slug") ?? "";
    this.slug.set(slug);

    const qp = this.route.snapshot.queryParamMap;
    const variantId = qp.get("variant_id");
    const billingPeriod = qp.get("variant_billing_period") as VariantPricing["billing_period"] | null;
    const basePrice = qp.get("variant_base_price");

    if (variantId && billingPeriod && basePrice) {
      this.selectedTier.set({
        variantName: "(cargando...)",
        basePrice: Number(basePrice),
        period: billingPeriod,
      });
    }

    if (!slug) {
      this.error.set("Falta el slug de la empresa");
      this.loading.set(false);
      return;
    }

    this.bookingService.getServices(slug).subscribe({
      next: (res) => {
        applyBrandingColors(res.company?.primary_color, res.company?.secondary_color);
        this.companyDomain.set(res.company?.name?.toLowerCase().replace(/[^a-z0-9]/g, "") || "");
        const serviceId = this.route.snapshot.paramMap.get("serviceId");
        const svc = res.services.find((s) => s.id === serviceId) ?? null;
        this.service.set(svc);

        if (svc && variantId) {
          const variant = svc.variants?.find((v) => v.id === variantId);
          if (variant) {
            this.selectedTier.set({
              variantName: variant.name,
              basePrice: Number(basePrice),
              period: billingPeriod,
            });
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || "Error al cargar el servicio");
        this.loading.set(false);
      },
    });
  }

  periodLabel(period: VariantPricing["billing_period"]): string {
    const labels: Record<VariantPricing["billing_period"], string> = {
      monthly: "mes",
      annual: "año",
      one_time: "pago único",
      session: "sesión",
      custom: "",
    };
    return labels[period] || period;
  }
}
