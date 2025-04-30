import { defineStore } from 'pinia';

export interface Tab {
  name: string;
  route: string;
  icon: string;
  closable: boolean;
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [] as Tab[],
    activeTab: null as string | null,
  }),

  actions: {
    addTab(tab: Tab) {
      const exists = this.tabs.some(t => t.route === tab.route);
      if (!exists) {
        this.tabs.push(tab);
      }
      this.activeTab = tab.route;
    },

    removeTab(route: string) {
      const index = this.tabs.findIndex(tab => tab.route === route);
      if (index !== -1) {
        this.tabs.splice(index, 1);
        if (this.activeTab === route) {
          this.activeTab = this.tabs[Math.min(index, this.tabs.length - 1)]?.route || null;
        }
      }
    },

    setActiveTab(route: string) {
      this.activeTab = route;
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'tabs',
        storage: localStorage,
      },
    ],
  },
});