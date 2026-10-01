import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './global.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('app');
}
