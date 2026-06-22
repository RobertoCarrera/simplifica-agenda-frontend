import { TestBed } from "@angular/core/testing";
import { FlyToCartService } from "./fly-to-cart.service";

/**
 * Specs for the fly-to-cart animation service. We don't drive the
 * animation timing (CSS transitions are out of scope for unit tests).
 * Instead we assert the public surface: target registration,
 * source resolution, and the no-op cases (no target, reduced motion).
 */
describe("FlyToCartService", () => {
  let service: FlyToCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlyToCartService);
  });

  afterEach(() => {
    // Clean up any clones that survived due to early test failures.
    document.body
      .querySelectorAll('[aria-hidden="true"]')
      .forEach((el) => el.remove());
    document
      .querySelectorAll(".cart-bump")
      .forEach((el) => el.classList.remove("cart-bump"));
  });

  it("is provided as a root singleton", () => {
    const same = TestBed.inject(FlyToCartService);
    expect(same).toBe(service);
  });

  it("does nothing when no target is registered", () => {
    // No setTarget call → target is null.
    const source = document.createElement("button");
    document.body.appendChild(source);

    expect(() => service.flyTo(source)).not.toThrow();
    // No clone should have been appended.
    expect(
      document.body.querySelectorAll('[aria-hidden="true"]').length,
    ).toBe(0);
  });

  it("appends a clone of the source element when target is set", () => {
    const target = document.createElement("a");
    target.id = "cart-button";
    document.body.appendChild(target);

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = "<h3>Prueba</h3><span>25€</span>";
    document.body.appendChild(card);

    const button = document.createElement("button");
    button.className = "btn-add";
    button.textContent = "Añadir";
    card.appendChild(button);

    service.setTarget(target);
    service.flyTo(button);

    const clones = document.body.querySelectorAll('[aria-hidden="true"]');
    expect(clones.length).toBe(1);
    // The clone should be the whole card, not just the button.
    const clone = clones[0] as HTMLElement;
    expect(clone.querySelector("h3")?.textContent).toBe("Prueba");
    expect(clone.querySelector(".btn-add")).not.toBeNull();

    // The clone should be positioned absolutely over the source.
    expect(clone.style.position).toBe("fixed");
    expect(clone.style.zIndex).toBe("9999");
    expect(clone.style.pointerEvents).toBe("none");
  });

  it("appends the .cart-bump class to the target", () => {
    const target = document.createElement("a");
    document.body.appendChild(target);

    const card = document.createElement("div");
    card.className = "product-card";
    document.body.appendChild(card);

    service.setTarget(target);
    service.flyTo(card);

    expect(target.classList.contains("cart-bump")).toBe(true);
  });

  it("falls back to the source element if no .product-card ancestor", () => {
    const target = document.createElement("a");
    document.body.appendChild(target);

    const orphanButton = document.createElement("button");
    orphanButton.textContent = "Lonely button";
    document.body.appendChild(orphanButton);

    service.setTarget(target);
    service.flyTo(orphanButton);

    // The clone is the orphan button itself.
    const clones = document.body.querySelectorAll('[aria-hidden="true"]');
    expect(clones.length).toBe(1);
    expect(clones[0].textContent).toBe("Lonely button");
  });

  it("skips the animation when prefers-reduced-motion is set", () => {
    // Override matchMedia for this test only.
    const original = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes("reduce"),
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia;

    try {
      // Re-create the service under the new matchMedia.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const reducedService = TestBed.inject(FlyToCartService);

      const target = document.createElement("a");
      document.body.appendChild(target);
      const card = document.createElement("div");
      card.className = "product-card";
      document.body.appendChild(card);

      reducedService.setTarget(target);
      reducedService.flyTo(card);

      // No clone should be appended, no bump class added.
      expect(
        document.body.querySelectorAll('[aria-hidden="true"]').length,
      ).toBe(0);
      expect(target.classList.contains("cart-bump")).toBe(false);
    } finally {
      window.matchMedia = original;
    }
  });

  it("clears the target when setTarget(null) is called", () => {
    const target = document.createElement("a");
    document.body.appendChild(target);

    const card = document.createElement("div");
    card.className = "product-card";
    document.body.appendChild(card);

    service.setTarget(target);
    service.setTarget(null);
    service.flyTo(card);

    // No clone, no bump.
    expect(document.body.querySelectorAll('[aria-hidden="true"]').length).toBe(0);
    expect(target.classList.contains("cart-bump")).toBe(false);
  });
});
