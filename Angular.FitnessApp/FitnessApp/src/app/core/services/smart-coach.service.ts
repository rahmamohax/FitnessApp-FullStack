import { Injectable, signal, computed, inject } from '@angular/core';
import { ChatMessage, ChatSession, HomeFeedResponse } from '../models/smart-coach.models';
import { ProfileService } from './profile.service';
import { WorkoutService } from './workout.service';
import { NutritionService } from './nutrition.service';
import { ProgressService } from './progress.service';

@Injectable({
  providedIn: 'root'
})
export class SmartCoachService {
  private profileService = inject(ProfileService);
  private workoutService = inject(WorkoutService);
  private nutritionService = inject(NutritionService);
  private progressService = inject(ProgressService);

  private sessionsSignal = signal<ChatSession[]>([
    {
      id: 'sess_1',
      title: 'Chest & Push Day Advice',
      date: 'Today',
      preview: 'Here is your optimal set and rep breakdown for chest power...'
    },
    {
      id: 'sess_2',
      title: 'Daily Macro Calibration',
      date: 'Yesterday',
      preview: 'Target 160g protein based on your current weight and goal.'
    },
    {
      id: 'sess_3',
      title: 'Rest Day Active Recovery',
      date: '3 days ago',
      preview: 'Focus on 30-min walking and hip mobility drills today.'
    }
  ]);

  private messagesSignal = signal<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'coach',
      text: 'Hello Rahma! I am your Super Fitness AI Coach. How can I empower your training or nutrition goals today?',
      timestamp: '10:00 AM'
    }
  ]);

  private isTypingSignal = signal<boolean>(false);

  readonly sessions = this.sessionsSignal.asReadonly();
  readonly messages = this.messagesSignal.asReadonly();
  readonly isTyping = this.isTypingSignal.asReadonly();

  readonly suggestedPrompts = [
    'Recommend a high-intensity Chest workout',
    'How much protein do I need today?',
    'What should I eat for a quick healthy breakfast?',
    'How do I break through a weight plateau?'
  ];

  /**
   * Generates HomeFeedResponse matching SmartCoachService/Features/GetHomeFeed/HomeFeedResponse.cs
   */
  getHomeFeed(): HomeFeedResponse {
    const profile = this.profileService.profile();
    const workouts = this.workoutService.getWorkouts().slice(0, 3);
    const meals = this.nutritionService.meals().slice(0, 3);
    const stats = this.progressService.stats();

    return {
      profile: {
        displayName: `${profile.firstName} ${profile.lastName}`,
        profilePictureUrl: profile.profilePictureUrl,
        height: profile.height,
        weight: profile.weight
      },
      metrics: profile.metrics ? {
        bmr: profile.metrics.bmr,
        tdee: profile.metrics.tdee,
        calorieTarget: profile.metrics.calorieTarget
      } : null,
      suggestedWorkouts: workouts,
      nutrition: {
        dailyGoalCalories: profile.metrics?.calorieTarget ?? 2200,
        recommendedMeals: meals.map(m => ({
          mealId: m.mealId,
          name: m.name,
          type: m.type as string,
          calories: m.calories,
          protein: m.protein
        }))
      },
      progress: {
        totalWorkouts: stats.totalWorkouts,
        totalCaloriesBurned: stats.totalCaloriesBurned,
        totalWeightLost: stats.weightLostKg,
        currentStreak: stats.currentStreakDays,
        longestStreak: stats.longestStreakDays
      },
      generatedAt: new Date().toISOString()
    };
  }

  sendMessage(text: string): void {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.messagesSignal.update(msgs => [...msgs, userMsg]);
    this.isTypingSignal.set(true);

    // Simulate AI thinking and smart contextual response
    setTimeout(() => {
      const response = this.generateAiResponse(text.toLowerCase());
      this.messagesSignal.update(msgs => [...msgs, response]);
      this.isTypingSignal.set(false);
    }, 900);
  }

  private generateAiResponse(input: string): ChatMessage {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (input.includes('chest') || input.includes('push') || input.includes('bench')) {
      return {
        id: 'coach_' + Date.now(),
        sender: 'coach',
        text: 'For chest hypertrophy, focus on progressive overload with compound barbell bench press, followed by incline angles for upper chest development and cable flyes for peak contraction. I have loaded your specialized routine:',
        timestamp: time,
        actionCard: {
          type: 'workout',
          title: 'Chest Hypertrophy & Power',
          subtitle: '45 mins • 5 Exercises • 380 kcal',
          actionLabel: 'Start Chest Routine',
          actionRoute: '/app/workouts/1'
        }
      };
    }

    if (input.includes('protein') || input.includes('macro') || input.includes('calories')) {
      const profile = this.profileService.profile();
      const targetProtein = Math.round(profile.weight * 2.0);
      return {
        id: 'coach_' + Date.now(),
        sender: 'coach',
        text: `Based on your weight of ${profile.weight} kg and "${profile.goal}" target, your recommended daily protein intake is approximately ${targetProtein}g (2.0g per kg of bodyweight). Spread this across 3-4 meals of 35-45g each to maximize muscle protein synthesis.`,
        timestamp: time,
        actionCard: {
          type: 'nutrition',
          title: 'Check Daily Nutrition Tracker',
          subtitle: `${targetProtein}g Target • View macro breakdown`,
          actionLabel: 'Open Nutrition',
          actionRoute: '/app/nutrition'
        }
      };
    }

    if (input.includes('breakfast') || input.includes('food') || input.includes('eat') || input.includes('meal')) {
      return {
        id: 'coach_' + Date.now(),
        sender: 'coach',
        text: 'A clean, high-satiety breakfast is essential for sustaining workout energy. I recommend our Avocado Toast with Poached Eggs & Chia (24g protein) or Greek Yogurt Parfait (30g protein).',
        timestamp: time,
        actionCard: {
          type: 'nutrition',
          title: 'Avocado Toast with Poached Eggs',
          subtitle: '420 kcal • 24g Protein • 15m prep',
          actionLabel: 'View Meal Recipe',
          actionRoute: '/app/nutrition'
        }
      };
    }

    if (input.includes('plateau') || input.includes('weight') || input.includes('progress')) {
      return {
        id: 'coach_' + Date.now(),
        sender: 'coach',
        text: 'Plateaus are normal adaptation points. To stimulate progress: 1) Increase your daily NEAT (aim for +2,000 steps); 2) Deload for 3-4 days to reset central nervous fatigue; 3) Re-check your calorie tracking for hidden oils and sauces. Consistency is your superpower!',
        timestamp: time,
        actionCard: {
          type: 'tip',
          title: 'Weight Tracking & Trends',
          subtitle: 'Log current weight to monitor 7-day rolling average',
          actionLabel: 'View Progress',
          actionRoute: '/app/progress'
        }
      };
    }

    // Default response
    return {
      id: 'coach_' + Date.now(),
      sender: 'coach',
      text: `Great question! To maximize results toward your goal, ensure you train with intensity within 1-2 reps in reserve (RIR), sleep 7-8 hours nightly, and hit your hydration targets. Let me know if you would like a custom workout or meal plan adjustment!`,
      timestamp: time
    };
  }

  clearChat(): void {
    this.messagesSignal.set([
      {
        id: 'msg_init',
        sender: 'coach',
        text: 'Welcome back! Your chat history was reset. What fitness target are we crushing next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }
}
