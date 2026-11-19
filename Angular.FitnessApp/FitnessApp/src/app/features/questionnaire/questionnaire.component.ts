import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityLevel, FitnessGoal, Gender, SubmitFitnessStatsRequest } from '../../core/models/fce.models';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-questionnaire',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0D0D12] text-white flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden">
      <!-- Background Ambient Glow -->
      <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Top Header & Step Progress Bar -->
      <header class="pt-4 z-10">
        <div class="flex items-center justify-between mb-4">
          @if (currentStep() > 1) {
            <button
              type="button"
              (click)="previousStep()"
              class="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
              aria-label="Previous step"
            >
              <app-icon name="arrow-left" size="18"/>
            </button>
          } @else {
            <div class="w-9"></div>
          }

          <span class="text-xs font-bold text-[#FF5722] uppercase tracking-widest">
            Step {{ currentStep() }} of 6
          </span>

          <button
            type="button"
            (click)="skipToApp()"
            class="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>

        <!-- 6 Segment Progress Bar -->
        <div class="grid grid-cols-6 gap-1.5 h-1.5 w-full">
          @for (s of [1, 2, 3, 4, 5, 6]; track s) {
            <div
              class="rounded-full transition-all duration-300"
              [class.bg-[#FF5722]]="s <= currentStep()"
              [class.bg-white/10]="s > currentStep()"
            ></div>
          }
        </div>
      </header>

      <!-- Main Step Body (Matching Figma screens) -->
      <main class="my-auto py-8 z-10 flex flex-col items-center text-center">
        <!-- STEP 1: GENDER -->
        @if (currentStep() === 1) {
          <div class="w-full animate-fade-in">
            <span class="text-xs font-bold text-[#FF5722] uppercase tracking-wider mb-2 block">Tell Us About Yourself</span>
            <h1 class="text-2xl font-black uppercase tracking-tight text-white mb-2">Choose Gender</h1>
            <p class="text-xs text-slate-400 mb-8 max-w-xs mx-auto">
              This helps our calculation engine calibrate metabolic rate and lean mass estimations.
            </p>

            <div class="grid grid-cols-2 gap-4">
              <!-- Male Card -->
              <button
                type="button"
                (click)="gender.set(Gender.Male)"
                class="p-6 rounded-3xl border text-center transition-all duration-200 group relative overflow-hidden"
                [class.border-[#FF5722]]="gender() === Gender.Male"
                [class.bg-[#FF5722]/10]="gender() === Gender.Male"
                [class.glow-orange-sm]="gender() === Gender.Male"
                [class.border-white/10]="gender() !== Gender.Male"
                [class.bg-[#161622]]="gender() !== Gender.Male"
              >
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  👨
                </div>
                <h3 class="text-base font-bold text-white mb-1">Male</h3>
                <span class="text-[11px] text-slate-400">Biological Male</span>
              </button>

              <!-- Female Card -->
              <button
                type="button"
                (click)="gender.set(Gender.Female)"
                class="p-6 rounded-3xl border text-center transition-all duration-200 group relative overflow-hidden"
                [class.border-[#FF5722]]="gender() === Gender.Female"
                [class.bg-[#FF5722]/10]="gender() === Gender.Female"
                [class.glow-orange-sm]="gender() === Gender.Female"
                [class.border-white/10]="gender() !== Gender.Female"
                [class.bg-[#161622]]="gender() !== Gender.Female"
              >
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  👩
                </div>
                <h3 class="text-base font-bold text-white mb-1">Female</h3>
                <span class="text-[11px] text-slate-400">Biological Female</span>
              </button>
            </div>
          </div>
        }

        <!-- STEP 2: AGE (Figma "old") -->
        @if (currentStep() === 2) {
          <div class="w-full animate-fade-in">
            <span class="text-xs font-bold text-[#FF5722] uppercase tracking-wider mb-2 block">Personal Metrics</span>
            <h1 class="text-2xl font-black uppercase tracking-tight text-white mb-2">How Old Are You?</h1>
            <p class="text-xs text-slate-400 mb-8 max-w-xs mx-auto">
              Age determines your baseline heart-rate training zones and cellular metabolic recovery.
            </p>

            <!-- Interactive Age Wheel / Selector -->
            <div class="my-6">
              <div class="text-6xl font-black text-white tracking-tight mb-2 flex items-center justify-center gap-1">
                <span>{{ age() }}</span>
                <span class="text-lg text-[#FF5722] font-semibold">years</span>
              </div>

              <!-- Quick Selector Carousel -->
              <div class="flex items-center justify-center gap-3 overflow-x-auto py-4 no-scrollbar">
                @for (a of ageOptions; track a) {
                  <button
                    type="button"
                    (click)="age.set(a)"
                    class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all"
                    [class.bg-[#FF5722]]="age() === a"
                    [class.text-white]="age() === a"
                    [class.scale-110]="age() === a"
                    [class.glow-orange-sm]="age() === a"
                    [class.bg-[#161622]]="age() !== a"
                    [class.text-slate-400]="age() !== a"
                  >
                    {{ a }}
                  </button>
                }
              </div>

              <!-- Slider control -->
              <input
                type="range"
                min="16"
                max="80"
                [value]="age()"
                (input)="onAgeChange($event)"
                class="w-full max-w-xs accent-[#FF5722] mt-4"
              />
            </div>
          </div>
        }

        <!-- STEP 3: WEIGHT (Figma "KG") -->
        @if (currentStep() === 3) {
          <div class="w-full animate-fade-in">
            <span class="text-xs font-bold text-[#FF5722] uppercase tracking-wider mb-2 block">Body Composition</span>
            <h1 class="text-2xl font-black uppercase tracking-tight text-white mb-2">What Is Your Weight?</h1>
            <p class="text-xs text-slate-400 mb-8 max-w-xs mx-auto">
              Used for daily macro nutrient calculations and strength-to-weight ratios.
            </p>

            <!-- Unit Toggle -->
            <div class="inline-flex rounded-xl p-1 bg-[#161622] border border-white/10 mb-6">
              <button
                type="button"
                (click)="weightUnit.set('kg')"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                [class.bg-[#FF5722]]="weightUnit() === 'kg'"
                [class.text-white]="weightUnit() === 'kg'"
                [class.text-slate-400]="weightUnit() !== 'kg'"
              >
                KG
              </button>
              <button
                type="button"
                (click)="weightUnit.set('lbs')"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                [class.bg-[#FF5722]]="weightUnit() === 'lbs'"
                [class.text-white]="weightUnit() === 'lbs'"
                [class.text-slate-400]="weightUnit() !== 'lbs'"
              >
                LBS
              </button>
            </div>

            <!-- Weight Display -->
            <div class="my-4">
              <div class="text-6xl font-black text-white tracking-tight mb-2 flex items-center justify-center gap-2">
                <span>{{ displayWeight() }}</span>
                <span class="text-lg text-[#FF5722] font-semibold">{{ weightUnit().toUpperCase() }}</span>
              </div>

              <!-- Slider control -->
              <input
                type="range"
                min="40"
                max="160"
                step="0.5"
                [value]="weightKg()"
                (input)="onWeightChange($event)"
                class="w-full max-w-xs accent-[#FF5722] mt-6"
              />

              <div class="flex justify-between max-w-xs mx-auto text-[11px] text-slate-500 mt-2 px-1">
                <span>40 kg</span>
                <span>100 kg</span>
                <span>160 kg</span>
              </div>
            </div>
          </div>
        }

        <!-- STEP 4: HEIGHT (Figma "hight") -->
        @if (currentStep() === 4) {
          <div class="w-full animate-fade-in">
            <span class="text-xs font-bold text-[#FF5722] uppercase tracking-wider mb-2 block">Body Metrics</span>
            <h1 class="text-2xl font-black uppercase tracking-tight text-white mb-2">What Is Your Height?</h1>
            <p class="text-xs text-slate-400 mb-8 max-w-xs mx-auto">
              Height provides baseline BMI reference and caloric expenditure coefficients.
            </p>

            <div class="my-4">
              <div class="text-6xl font-black text-white tracking-tight mb-2 flex items-center justify-center gap-2">
                <span>{{ heightCm() }}</span>
                <span class="text-lg text-[#FF5722] font-semibold">CM</span>
              </div>

              <!-- Height Slider -->
              <input
                type="range"
                min="130"
                max="220"
                [value]="heightCm()"
                (input)="onHeightChange($event)"
                class="w-full max-w-xs accent-[#FF5722] mt-6"
              />

              <div class="flex justify-between max-w-xs mx-auto text-[11px] text-slate-500 mt-2 px-1">
                <span>130 cm</span>
                <span>175 cm</span>
                <span>220 cm</span>
              </div>
            </div>
          </div>
        }

        <!-- STEP 5: GOAL (Figma "goal") -->
        @if (currentStep() === 5) {
          <div class="w-full animate-fade-in">
            <span class="text-xs font-bold text-[#FF5722] uppercase tracking-wider mb-2 block">Target Destination</span>
            <h1 class="text-2xl font-black uppercase tracking-tight text-white mb-2">What Is Your Goal?</h1>
            <p class="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
              We personalize your recommended workouts and daily calories to align with this outcome.
            </p>

            <div class="space-y-2.5 text-left">
              @for (g of goalOptions; track g.value) {
                <button
                  type="button"
                  (click)="goal.set(g.value)"
                  class="w-full p-4 rounded-2xl border transition-all flex items-center justify-between"
                  [class.border-[#FF5722]]="goal() === g.value"
                  [class.bg-[#FF5722]/10]="goal() === g.value"
                  [class.glow-orange-sm]="goal() === g.value"
                  [class.border-white/10]="goal() !== g.value"
                  [class.bg-[#161622]]="goal() !== g.value"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xl">{{ g.icon }}</span>
                    <div>
                      <h4 class="text-sm font-bold text-white">{{ g.label }}</h4>
                      <p class="text-[11px] text-slate-400">{{ g.description }}</p>
                    </div>
                  </div>

                  <div
                    class="w-5 h-5 rounded-full border flex items-center justify-center"
                    [class.border-[#FF5722]]="goal() === g.value"
                    [class.bg-[#FF5722]]="goal() === g.value"
                    [class.border-white/20]="goal() !== g.value"
                  >
                    @if (goal() === g.value) {
                      <div class="w-2 h-2 rounded-full bg-white"></div>
                    }
                  </div>
                </button>
              }
            </div>
          </div>
        }

        <!-- STEP 6: ACTIVITY LEVEL (Figma "activity") -->
        @if (currentStep() === 6) {
          <div class="w-full animate-fade-in">
            <span class="text-xs font-bold text-[#FF5722] uppercase tracking-wider mb-2 block">Energy Expenditure</span>
            <h1 class="text-2xl font-black uppercase tracking-tight text-white mb-2">Regular Activity Level?</h1>
            <p class="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
              Select how active your daily lifestyle and work routine is.
            </p>

            <div class="space-y-2.5 text-left">
              @for (act of activityOptions; track act.value) {
                <button
                  type="button"
                  (click)="activityLevel.set(act.value)"
                  class="w-full p-4 rounded-2xl border transition-all flex items-center justify-between"
                  [class.border-[#FF5722]]="activityLevel() === act.value"
                  [class.bg-[#FF5722]/10]="activityLevel() === act.value"
                  [class.glow-orange-sm]="activityLevel() === act.value"
                  [class.border-white/10]="activityLevel() !== act.value"
                  [class.bg-[#161622]]="activityLevel() !== act.value"
                >
                  <div>
                    <div class="flex items-center gap-2 mb-0.5">
                      <h4 class="text-sm font-bold text-white">{{ act.label }}</h4>
                      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {{ act.badge }}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400">{{ act.description }}</p>
                  </div>

                  <div
                    class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3"
                    [class.border-[#FF5722]]="activityLevel() === act.value"
                    [class.bg-[#FF5722]]="activityLevel() === act.value"
                    [class.border-white/20]="activityLevel() !== act.value"
                  >
                    @if (activityLevel() === act.value) {
                      <div class="w-2 h-2 rounded-full bg-white"></div>
                    }
                  </div>
                </button>
              }
            </div>
          </div>
        }
      </main>

      <!-- Bottom Next / Continue Button -->
      <footer class="z-10 pb-4">
        <button
          type="button"
          (click)="nextStep()"
          class="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-bold text-base hover:opacity-95 active:scale-[0.99] transition-all shadow-xl shadow-[#FF5722]/30 flex items-center justify-center gap-2"
        >
          <span>{{ currentStep() === 6 ? 'Generate My Program' : 'Continue' }}</span>
          <app-icon name="arrow-right" size="18"/>
        </button>
      </footer>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class QuestionnaireComponent {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  Gender = Gender;

  currentStep = signal<number>(1);

  // Stats state
  gender = signal<Gender>(Gender.Male);
  age = signal<number>(25);
  weightKg = signal<number>(82.5);
  weightUnit = signal<'kg' | 'lbs'>('kg');
  heightCm = signal<number>(178);
  goal = signal<FitnessGoal>(FitnessGoal.GetFitter);
  activityLevel = signal<ActivityLevel>(ActivityLevel.Intermediate);

  ageOptions = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 35, 40];

  goalOptions = [
    { value: FitnessGoal.LoseWeight, label: 'Lose Weight', description: 'Burn body fat & increase lean muscle definition', icon: '🔥' },
    { value: FitnessGoal.GetFitter, label: 'Get Fitter & Tone', description: 'Boost cardiovascular health & athletic agility', icon: '⚡' },
    { value: FitnessGoal.GainWeight, label: 'Gain Weight / Mass', description: 'Hypertrophy resistance program to pack on muscle mass', icon: '💪' },
    { value: FitnessGoal.GainMoreFlexible, label: 'Gain More Flexible', description: 'Mobility, core balance, and dynamic stretching', icon: '🧘' },
    { value: FitnessGoal.LearnTheBasic, label: 'Learn the Basics', description: 'Master foundational gym movements with safe form', icon: '🎯' }
  ];

  activityOptions = [
    { value: ActivityLevel.Rookie, label: 'Rookie', badge: 'Sedentary', description: 'Desk job, minimal daily walking or exercise' },
    { value: ActivityLevel.Beginner, label: 'Beginner', badge: 'Light', description: '1-2 light workout sessions per week' },
    { value: ActivityLevel.Intermediate, label: 'Intermediate', badge: 'Moderate', description: '3-4 consistent workout sessions per week' },
    { value: ActivityLevel.Advance, label: 'Advance', badge: 'Active', description: '5-6 intense sports or gym training sessions' },
    { value: ActivityLevel.TrueBeast, label: 'True Beast', badge: 'Heavy', description: 'Twice-a-day athlete training or heavy physical labor' }
  ];

  displayWeight(): number {
    if (this.weightUnit() === 'lbs') {
      return Math.round(this.weightKg() * 2.20462);
    }
    return this.weightKg();
  }

  onAgeChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.age.set(val);
  }

  onWeightChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.weightKg.set(val);
  }

  onHeightChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.heightCm.set(val);
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  nextStep(): void {
    if (this.currentStep() < 6) {
      this.currentStep.update(s => s + 1);
    } else {
      this.finishQuestionnaire();
    }
  }

  finishQuestionnaire(): void {
    const stats: SubmitFitnessStatsRequest = {
      gender: this.gender(),
      age: this.age(),
      weight: this.weightKg(),
      height: this.heightCm(),
      goal: this.goal(),
      activityLevel: this.activityLevel()
    };

    const res = this.profileService.updateMetrics(stats);
    this.authService.completeProfileOnboarding();

    this.toastService.success(
      `Calculated: ${res.data?.metrics?.calorieTarget} kcal/day Target. Welcome to Super Fitness!`,
      'Profile Calibrated'
    );

    this.router.navigate(['/app/home']);
  }

  skipToApp(): void {
    this.authService.completeProfileOnboarding();
    this.router.navigate(['/app/home']);
  }
}
