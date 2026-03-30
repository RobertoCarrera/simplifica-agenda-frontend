import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "./shared/ui/header.component";
import { FooterComponent } from "./shared/ui/footer.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="app-layout">
      <app-header />
      <main class="app-container">
        <router-outlet></router-outlet>
      </main>
      <app-footer />
    </div>
  `,
  styles: [
    `
      .app-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .app-container {
        flex: 1;
        font-family:
          "Inter",
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          sans-serif;
      }
    `,
  ],
})
export class AppComponent {}
