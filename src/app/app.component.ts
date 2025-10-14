import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HotelSoft';
  fontSize = 16; // tamaño base en px

  // Aumentar texto
  increaseFont() {
    this.fontSize += 2;
    document.documentElement.style.setProperty('--font-size-base', `${this.fontSize}px`);
  }

  // Disminuir texto
  decreaseFont() {
    if (this.fontSize > 10) {
      this.fontSize -= 2;
      document.documentElement.style.setProperty('--font-size-base', `${this.fontSize}px`);
    }
  }

  // Alternar alto contraste
  toggleContrast() {
    document.body.classList.toggle('high-contrast');
  }
}
