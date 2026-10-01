import { Component, signal, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-battery-status',
  standalone: true,
  imports: [],
  template: `
    <div class="battery-card">
      <div class="header">
        <h2>Laptop Battery Status</h2>
        <span class="status-badge" [class.charging]="isCharging()">
          {{ isCharging() ? '⚡ Charging' : '🔋 On Battery' }}
        </span>
      </div>

      @if (isSupported()) {
        <div class="battery-visual">
          <div class="battery-body">
            <div 
              class="battery-level" 
              [style.width.%]="batteryLevel() * 100"
              [class.low]="batteryLevel() <= 0.2"
            ></div>
          </div>
          <span class="percentage">{{ (batteryLevel() * 100).toFixed(0) }}%</span>
        </div>

        <div class="metrics-grid">
          <div class="metric">
            <span class="label">Time Remaining</span>
            <span class="value">{{ formatTime(dischargingTime()) }}</span>
          </div>
          <div class="metric">
            <span class="label">Time to Full</span>
            <span class="value">{{ formatTime(chargingTime()) }}</span>
          </div>
        </div>
      } @else {
        <p class="unsupported">Battery Status API is not supported or disabled in this browser environment.</p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .battery-card {
      background: oklch(0.2 0.02 264 / 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid oklch(0.4 0.05 264 / 0.3);
      border-radius: 1.25rem;
      padding: 1.75rem;
      color: oklch(0.95 0.01 264);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3);
      max-width: 400px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .status-badge {
      font-size: 0.85rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      background: oklch(0.3 0.05 264);
      color: oklch(0.85 0.05 264);
      font-weight: 500;
    }

    .status-badge.charging {
      background: oklch(0.4 0.15 145 / 0.3);
      color: oklch(0.8 0.2 145);
      border: 1px solid oklch(0.5 0.2 145 / 0.4);
    }

    .battery-visual {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.75rem;
    }

    .battery-body {
      flex: 1;
      height: 2.25rem;
      background: oklch(0.15 0.02 264);
      border: 2px solid oklch(0.4 0.05 264);
      border-radius: 0.75rem;
      padding: 3px;
      position: relative;
    }

    .battery-body::after {
      content: '';
      position: absolute;
      right: -7px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 12px;
      background: oklch(0.4 0.05 264);
      border-radius: 0 2px 2px 0;
    }

    .battery-level {
      height: 100%;
      background: linear-gradient(90deg, oklch(0.6 0.2 145), oklch(0.65 0.22 135));
      border-radius: 0.45rem;
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .battery-level.low {
      background: linear-gradient(90deg, oklch(0.6 0.25 30), oklch(0.65 0.25 20));
    }

    .percentage {
      font-size: 1.5rem;
      font-weight: 700;
      min-width: 4rem;
      text-align: right;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .metric {
      background: oklch(0.15 0.02 264 / 0.5);
      padding: 0.85rem;
      border-radius: 0.75rem;
      border: 1px solid oklch(0.3 0.02 264 / 0.3);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .label {
      font-size: 0.75rem;
      color: oklch(0.7 0.02 264);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .value {
      font-size: 0.95rem;
      font-weight: 600;
    }

    .unsupported {
      color: oklch(0.7 0.15 30);
      font-size: 0.9rem;
      margin: 0;
    }
  `]
})
export class BatteryStatusComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private batteryManager: any = null;

  isSupported = signal<boolean>(false);
  batteryLevel = signal<number>(1);
  isCharging = signal<boolean>(false);
  chargingTime = signal<number>(Infinity);
  dischargingTime = signal<number>(Infinity);

  async ngOnInit() {
    if (!this.isBrowser || !('getBattery' in navigator)) {
      this.isSupported.set(false);
      return;
    }

    try {
      this.isSupported.set(true);
      // @ts-ignore
      this.batteryManager = await navigator.getBattery();
      this.updateBatteryValues();

      // Attach event listeners for real-time reactivity
      this.batteryManager.addEventListener('levelchange', this.boundUpdate);
      this.batteryManager.addEventListener('chargingchange', this.boundUpdate);
      this.batteryManager.addEventListener('chargingtimechange', this.boundUpdate);
      this.batteryManager.addEventListener('dischargingtimechange', this.boundUpdate);
    } catch (e) {
      console.error('Error accessing Battery Status API:', e);
      this.isSupported.set(false);
    }
  }

  private boundUpdate = () => this.updateBatteryValues();

  private updateBatteryValues() {
    if (!this.batteryManager) return;
    this.batteryLevel.set(this.batteryManager.level);
    this.isCharging.set(this.batteryManager.charging);
    this.chargingTime.set(this.batteryManager.chargingTime);
    this.dischargingTime.set(this.batteryManager.dischargingTime);
  }

  ngOnDestroy() {
    if (this.batteryManager) {
      this.batteryManager.removeEventListener('levelchange', this.boundUpdate);
      this.batteryManager.removeEventListener('chargingchange', this.boundUpdate);
      this.batteryManager.removeEventListener('chargingtimechange', this.boundUpdate);
      this.batteryManager.removeEventListener('dischargingtimechange', this.boundUpdate);
    }
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return 'Calculating...';
    if (seconds === 0) return 'Fully charged';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }
}