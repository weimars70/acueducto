import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMainContentStore = defineStore('mainContent', () => {
  const currentView = ref('home');

  const setCurrentView = (view: string) => {
    currentView.value = view;
  };

  return {
    currentView,
    setCurrentView
  };
});