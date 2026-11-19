import { Component, ChangeDetectionStrategy, inject, signal, ElementRef, viewChild, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SmartCoachService } from '../../core/services/smart-coach.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-smart-coach',
  imports: [RouterLink, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-[calc(100vh-8.5rem)] md:h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 animate-fade-in">
      <!-- Previous Conversations Drawer (Figma "Previous Conversations" frame) -->
      <aside
        class="hidden md:flex flex-col w-72 rounded-3xl bg-[#161622] border border-white/5 p-4 shrink-0 shadow-xl"
      >
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <div class="flex items-center gap-2">
            <app-icon name="chat" size="16" cssClass="text-[#FF5722]"/>
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Previous Chats</h3>
          </div>
          <button
            type="button"
            (click)="smartCoachService.clearChat()"
            class="text-[11px] text-[#FF5722] hover:underline"
            title="Start fresh conversation"
          >
            New Chat
          </button>
        </div>

        <div class="space-y-2 overflow-y-auto pr-1 flex-1">
          @for (sess of smartCoachService.sessions(); track sess.id) {
            <div class="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-xs font-semibold text-white group-hover:text-[#FF5722] transition-colors truncate">
                  {{ sess.title }}
                </h4>
                <span class="text-[10px] text-slate-500">{{ sess.date }}</span>
              </div>
              <p class="text-[11px] text-slate-400 line-clamp-1">{{ sess.preview }}</p>
            </div>
          }
        </div>

        <!-- Coach Status Badge -->
        <div class="pt-3 border-t border-white/5 mt-auto flex items-center gap-3">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="text-xs text-slate-400 font-medium">Smart AI Coach Online</span>
        </div>
      </aside>

      <!-- Main Chat Area -->
      <section class="flex-1 rounded-3xl bg-[#161622] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
        <!-- Chat Header -->
        <header class="p-4 border-b border-white/5 bg-[#14141E] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- 3D Bot Avatar graphic matching Figma -->
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] flex items-center justify-center text-white shadow-lg shadow-[#FF5722]/30 relative">
              <app-icon name="bot" size="22"/>
              <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#14141E]"></span>
            </div>
            <div>
              <h2 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Super Coach AI</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-md bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/30">V2.0</span>
              </h2>
              <p class="text-[11px] text-slate-400">Trained on biomechanics, nutrition & FCE calculations</p>
            </div>
          </div>

          <button
            type="button"
            (click)="smartCoachService.clearChat()"
            class="md:hidden text-xs text-[#FF5722] font-semibold px-2 py-1 rounded-lg bg-white/5"
          >
            Reset
          </button>
        </header>

        <!-- Message List -->
        <div #scrollContainer class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          <!-- Welcome Hero inside Chat (Figma graphic header) -->
          <div class="p-5 rounded-3xl bg-gradient-to-b from-[#1E1E2C] to-[#161622] border border-white/5 text-center my-2 max-w-lg mx-auto">
            <div class="w-16 h-16 mx-auto mb-3 rounded-3xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center text-3xl glow-orange-sm">
              🤖
            </div>
            <h3 class="text-lg font-black uppercase text-white mb-1">How Can I Assist You Today?</h3>
            <p class="text-xs text-slate-400 leading-relaxed mb-4">
              Ask about personalized workout routines, protein targets, muscle soreness recovery, or optimal exercise technique.
            </p>

            <!-- Quick Starter Chips (Figma prompt suggestions) -->
            <div class="flex flex-wrap items-center justify-center gap-2">
              @for (prompt of smartCoachService.suggestedPrompts; track prompt) {
                <button
                  type="button"
                  (click)="sendQuickPrompt(prompt)"
                  class="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#FF5722]/20 hover:text-[#FF5722] hover:border-[#FF5722]/40 border border-white/10 text-slate-300 transition-all text-left"
                >
                  {{ prompt }}
                </button>
              }
            </div>
          </div>

          <!-- Message Bubbles -->
          @for (msg of smartCoachService.messages(); track msg.id) {
            <div
              class="flex flex-col"
              [class.items-end]="msg.sender === 'user'"
              [class.items-start]="msg.sender === 'coach'"
            >
              <div
                class="max-w-md rounded-3xl p-4 shadow-lg transition-all"
                [class.bg-gradient-to-r]="msg.sender === 'user'"
                [class.from-[#FF5722]]="msg.sender === 'user'"
                [class.to-[#FF7043]]="msg.sender === 'user'"
                [class.text-white]="msg.sender === 'user'"
                [class.rounded-tr-sm]="msg.sender === 'user'"
                [class.bg-[#1E1E2D]]="msg.sender === 'coach'"
                [class.border]="msg.sender === 'coach'"
                [class.border-white/5]="msg.sender === 'coach'"
                [class.text-slate-200]="msg.sender === 'coach'"
                [class.rounded-tl-sm]="msg.sender === 'coach'"
              >
                <p class="text-xs sm:text-sm leading-relaxed whitespace-pre-line">{{ msg.text }}</p>

                <!-- Embedded Action Card (Figma smart suggestion cards) -->
                @if (msg.actionCard; as card) {
                  <div class="mt-3 p-3 rounded-2xl bg-black/40 border border-white/10">
                    <div class="flex items-center gap-2 mb-1">
                      @if (card.type === 'workout') {
                        <app-icon name="dumbbell" size="14" cssClass="text-[#FF5722]"/>
                      } @else if (card.type === 'nutrition') {
                        <app-icon name="utensils" size="14" cssClass="text-emerald-400"/>
                      } @else {
                        <app-icon name="sparkles" size="14" cssClass="text-amber-400"/>
                      }
                      <span class="text-xs font-bold text-white">{{ card.title }}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 mb-2">{{ card.subtitle }}</p>
                    <a
                      [routerLink]="card.actionRoute"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF5722] text-white font-bold text-[11px] hover:opacity-90 transition-opacity"
                    >
                      <span>{{ card.actionLabel }}</span>
                      <app-icon name="arrow-right" size="12"/>
                    </a>
                  </div>
                }
              </div>

              <span class="text-[10px] text-slate-500 mt-1 px-1">
                {{ msg.sender === 'user' ? 'You' : 'Super Coach' }} • {{ msg.timestamp }}
              </span>
            </div>
          }

          <!-- Typing Indicator -->
          @if (smartCoachService.isTyping()) {
            <div class="flex items-center gap-2 text-slate-400 text-xs p-3 rounded-2xl bg-[#1E1E2D] w-fit border border-white/5">
              <div class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce"></span>
                <span class="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce" style="animation-delay: 0.15s"></span>
                <span class="w-2 h-2 rounded-full bg-[#FF5722] animate-bounce" style="animation-delay: 0.3s"></span>
              </div>
              <span class="text-[11px]">Coach is analyzing...</span>
            </div>
          }
        </div>

        <!-- Chat Input Form -->
        <form (ngSubmit)="sendCurrentMessage()" class="p-3 sm:p-4 border-t border-white/5 bg-[#14141E] flex items-center gap-2">
          <input
            type="text"
            [(ngModel)]="inputText"
            name="chatInput"
            placeholder="Ask your coach anything (e.g. chest routine, protein intake)..."
            class="flex-1 px-4 py-3 rounded-2xl bg-[#1C1C28] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF5722] transition-colors"
          />

          <button
            type="submit"
            [disabled]="!inputText.trim()"
            class="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white flex items-center justify-center hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-[#FF5722]/30 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            <app-icon name="arrow-right" size="18"/>
          </button>
        </form>
      </section>
    </div>
  `
})
export class SmartCoachComponent {
  smartCoachService = inject(SmartCoachService);
  private toastService = inject(ToastService);

  scrollContainer = viewChild<ElementRef>('scrollContainer');
  inputText = '';

  constructor() {
    effect(() => {
      // Auto-scroll to bottom whenever messages change
      const msgs = this.smartCoachService.messages();
      setTimeout(() => {
        const el = this.scrollContainer()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      }, 50);
    });
  }

  sendCurrentMessage(): void {
    if (!this.inputText.trim()) return;
    const text = this.inputText;
    this.inputText = '';
    this.smartCoachService.sendMessage(text);
  }

  sendQuickPrompt(prompt: string): void {
    this.smartCoachService.sendMessage(prompt);
  }
}
