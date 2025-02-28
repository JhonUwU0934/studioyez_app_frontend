import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'acr_plus_allies_new';
  isDarkMode = false;

  
  ngOnInit(): void {
    this.loadTheme();
  }

  private loadTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      this.isDarkMode = JSON.parse(storedTheme);
      document.body.classList.toggle('dark-theme', this.isDarkMode);
    }
  }
}
