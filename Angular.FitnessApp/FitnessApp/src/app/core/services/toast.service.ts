import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(type: 'success' | 'info' | 'warning' | 'error', message: string, title?: string, duration = 3500): void {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5);
    const toast: ToastMessage = { id, type, title, message, duration };

    this.toastsSignal.update(list => [...list, toast]);

    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  success(message: string, title?: string): void {
    this.show('success', message, title);
  }

  info(message: string, title?: string): void {
    this.show('info', message, title);
  }

  warning(message: string, title?: string): void {
    this.show('warning', message, title);
  }

  error(message: string, title?: string): void {
    this.show('error', message, title);
  }

  dismiss(id: string): void {
    this.toastsSignal.update(list => list.filter(t => t.id !== id));
  }
}
