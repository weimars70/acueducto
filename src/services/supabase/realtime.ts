import { supabase } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeService {
  private channel: RealtimeChannel | null = null;

  subscribeToConsumptions(onUpdate: () => void) {
    if (this.channel) {
      this.channel.unsubscribe();
    }

    this.channel = supabase
      .channel('consumption_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consumo'
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      if (this.channel) {
        this.channel.unsubscribe();
        this.channel = null;
      }
    };
  }
}

export const realtimeService = new RealtimeService();