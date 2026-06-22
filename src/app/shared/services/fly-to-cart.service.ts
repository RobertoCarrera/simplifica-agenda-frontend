import { Injectable } from "@angular/core";

/**
 * Animates a flying clone of a product card from its current
 * position to the cart icon in the header. The actual cart
 * addition happens separately via CartService — this is purely
 * the visual flourish.
 *
 * The cart icon must register itself as the target by calling
 * `setTarget(element)` after view init. If no target is registered
 * (e.g. the cart button isn't visible because there's no slug in
 * the URL), `flyTo` silently no-ops.
 *
 * Respects `prefers-reduced-motion`: if the user has that preference
 * set, the animation is skipped entirely. The cart still gets the
 * item via the separate CartService.add call.
 */
@Injectable({ providedIn: "root" })
export class FlyToCartService {
  private targetEl: HTMLElement | null = null;
  private prefersReducedMotion = false;

  constructor() {
    if (typeof window !== "undefined" && window.matchMedia) {
      this.prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    }
  }

  /**
   * Register the DOM element that flying items should fly to (the
   * cart icon button in the header). Pass null to clear.
   *
   * Called by HeaderComponent after view init and whenever the cart
   * button becomes available (it is conditionally rendered).
   */
  setTarget(el: HTMLElement | null): void {
    this.targetEl = el;
  }

  /**
   * Animate a clone of the closest product card (or the source
   * element itself if there is no card ancestor) from its current
   * position to the registered target.
   *
   * The clone is removed after ~700ms. The cart badge on the
   * target gets a brief "bump" class for visual feedback on arrival.
   *
   * Returns immediately if `prefers-reduced-motion` is set or no
   * target is registered. The caller should always invoke
   * `CartService.add(product)` separately — this method only
   * handles the animation.
   */
  flyTo(sourceEl: HTMLElement): void {
    const target = this.targetEl;
    if (!target || this.prefersReducedMotion) return;
    if (typeof document === "undefined") return;

    // Find the card to clone. If the source is a button, walk up to
    // the nearest product-card or cart-line so the whole card flies.
    const cardEl =
      sourceEl.closest(".product-card, .cart-line") ?? sourceEl;

    const cardRect = cardEl.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // Compute where the clone should land: centered on the target.
    const landingLeft =
      targetRect.left + targetRect.width / 2 - cardRect.width / 2;
    const landingTop =
      targetRect.top + targetRect.height / 2 - cardRect.height / 2;

    // Clone the card.
    const clone = cardEl.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.margin = "0";
    clone.style.width = `${cardRect.width}px`;
    clone.style.height = `${cardRect.height}px`;
    clone.style.transform = `translate(${cardRect.left}px, ${cardRect.top}px)`;
    clone.style.transformOrigin = "center center";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.18)";
    clone.style.borderRadius = "0.75rem";
    clone.style.overflow = "hidden";
    clone.setAttribute("aria-hidden", "true");
    document.body.appendChild(clone);

    // Force layout flush so the initial transform is committed
    // before we transition to the landing transform.
    void clone.offsetWidth;

    // Animate to the target. Two-property transition so scale and
    // opacity animate together. Easing is "ease-in" so the card
    // accelerates as it approaches the cart (feels like it falls in).
    clone.style.transition =
      "transform 650ms cubic-bezier(0.55, 0.06, 0.68, 0.19), opacity 600ms ease-in";
    clone.style.transform = `translate(${landingLeft}px, ${landingTop}px) scale(0.2)`;
    clone.style.opacity = "0";

    // Bump the cart icon for visual feedback.
    target.classList.add("cart-bump");

    // Cleanup after the animation ends.
    const cleanup = () => {
      clone.remove();
      target.classList.remove("cart-bump");
    };
    // Fallback if the transitionend event doesn't fire (e.g. element
    // is removed from layout early).
    setTimeout(cleanup, 750);
  }
}
