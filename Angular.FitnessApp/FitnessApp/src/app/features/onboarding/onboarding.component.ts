import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  highlight: string;
  image: string;
}

@Component({
  selector: 'app-onboarding',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0D0D12] text-white flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden">
      <!-- Background Ambient Glow -->
      <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Top Bar: Logo & Skip -->
      <header class="flex items-center justify-between z-10 pt-4">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] flex items-center justify-center text-white shadow-lg shadow-[#FF5722]/30">
            <app-icon name="dumbbell" size="20"/>
          </div>
          <span class="font-extrabold tracking-wider uppercase text-sm text-white">Super Fitness</span>
        </div>

        <button
          type="button"
          (click)="skipToLogin()"
          class="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
        >
          Skip
        </button>
      </header>

      <!-- Main Slide Card / Carousel -->
      <main class="my-auto z-10 flex flex-col items-center text-center">
        <!-- Hero Athlete Image with Sleek Dark Glow -->
        <div class="relative w-72 h-80 sm:w-80 sm:h-96 rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl group">
          <img
            [src]="currentSlide().image"
            [alt]="currentSlide().title"
            class="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-transparent to-black/20"></div>

          <!-- Badge tag -->
          <div class="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-[#FF8A65]">
            {{ currentSlide().highlight }}
          </div>
        </div>

        <!-- Typography matching Figma -->
        <h2 class="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white leading-tight mb-3">
          {{ currentSlide().title }}
        </h2>
        <p class="text-sm text-slate-400 max-w-xs leading-relaxed">
          {{ currentSlide().subtitle }}
        </p>

        <!-- Pagination Dots -->
        <div class="flex items-center gap-2 mt-6" aria-label="Slide Indicator">
          @for (slide of slides; track slide.id; let idx = $index) {
            <button
              type="button"
              (click)="activeSlideIndex.set(idx)"
              [class.w-8]="activeSlideIndex() === idx"
              [class.bg-[#FF5722]]="activeSlideIndex() === idx"
              [class.w-2.5]="activeSlideIndex() !== idx"
              [class.bg-white/20]="activeSlideIndex() !== idx"
              class="h-2.5 rounded-full transition-all duration-300"
              [attr.aria-label]="'Go to slide ' + (idx + 1)"
            ></button>
          }
        </div>
      </main>

      <!-- Bottom Controls -->
      <footer class="z-10 pb-4 space-y-3">
        @if (activeSlideIndex() < slides.length - 1) {
          <button
            type="button"
            (click)="nextSlide()"
            class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-bold text-base hover:opacity-95 active:scale-[0.99] transition-all shadow-xl shadow-[#FF5722]/30 flex items-center justify-center gap-2"
          >
            <span>Next</span>
            <app-icon name="arrow-right" size="18"/>
          </button>
        } @else {
          <button
            type="button"
            (click)="getStarted()"
            class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-bold text-base hover:opacity-95 active:scale-[0.99] transition-all shadow-xl shadow-[#FF5722]/30 glow-orange flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <app-icon name="arrow-right" size="18"/>
          </button>
        }

        <div class="text-center">
          <p class="text-xs text-slate-400">
            Already have an account?
            <a routerLink="/auth/login" class="text-[#FF5722] font-semibold hover:underline ml-1">Log In</a>
          </p>
        </div>
      </footer>
    </div>
  `
})
export class OnboardingComponent {
  private router = inject(Router);

  slides: OnboardingSlide[] = [
    {
      id: 1,
      title: 'The Price Of Excellence Is Discipline',
      subtitle: 'Commit to your daily fitness journey with personalized workouts and real-time guidance.',
      highlight: 'Daily Consistency',
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'Fitness Has Never Been So Much Fun',
      subtitle: 'Gamified streaks, rewarding achievements, and smart coaching that keeps you motivated.',
      highlight: 'Interactive Training',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      title: 'NO PAIN NO GAINS Do It Now',
      subtitle: 'Start sculpting your dream physique today. Your tailored fitness journey begins now.',
      highlight: 'Unstoppable Results',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
    }
  ];

  activeSlideIndex = signal<number>(0);

  currentSlide = () => this.slides[this.activeSlideIndex()];

  nextSlide(): void {
    if (this.activeSlideIndex() < this.slides.length - 1) {
      this.activeSlideIndex.update(i => i + 1);
    }
  }

  skipToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  getStarted(): void {
    this.router.navigate(['/auth/register']);
  }
}
