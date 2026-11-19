import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;

  isLoading = signal(false);

  startRequest(): void {
    this.activeRequests++;
    this.isLoading.set(this.activeRequests > 0);
  }

  finishRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.isLoading.set(this.activeRequests > 0);
  }
}