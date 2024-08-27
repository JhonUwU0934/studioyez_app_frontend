import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _isDarkMode = false;

  get getIsDarkMode() {
    return this._isDarkMode;
  }

  set setIsDarkMode(value: boolean) {
    this._isDarkMode = value;
  }

  constructor() {}

  public bodyContain(): boolean {
    const contain = document.body.classList.contains('dark-theme');
    if (contain) {
      return true;
    } else {
      return false;
    }
  }

  public toggleTheme() {
    this._isDarkMode = !this._isDarkMode;
    document.body.classList.toggle('dark-theme', this._isDarkMode);
    this.saveTheme();
  }

  private saveTheme() {
    localStorage.setItem('theme', JSON.stringify(this._isDarkMode));
  }
}
