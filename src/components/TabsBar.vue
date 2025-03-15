<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTabsStore } from '../stores/tabs';

const router = useRouter();
const tabsStore = useTabsStore();

const tabs = computed(() => tabsStore.tabs);
const activeTab = computed(() => tabsStore.activeTab);

const handleTabClick = (route: string) => {
  tabsStore.setActiveTab(route);
  router.push(route);
};

const handleTabClose = (route: string) => {
  tabsStore.removeTab(route);
  if (tabs.value.length > 0) {
    router.push(tabs.value[tabs.value.length - 1].route);
  } else {
    router.push('/dashboard');
  }
};
</script>

<template>
  <q-tabs
    v-model="activeTab"
    dense
    class="bg-white"
    active-color="primary"
    indicator-color="primary"
    align="left"
    narrow-indicator
  >
    <q-tab
      v-for="tab in tabs"
      :key="tab.route"
      :name="tab.route"
      class="custom-tab"
      @click="handleTabClick(tab.route)"
    >
      <template v-slot:default>
        <div class="row items-center no-wrap q-gutter-x-xs">
          <q-icon :name="tab.icon" size="16px" />
          <div class="tab-label">{{ tab.name }}</div>
          <q-btn
            v-if="tab.closable"
            flat
            dense
            round
            size="xs"
            icon="close"
            class="close-btn"
            @click.stop="handleTabClose(tab.route)"
          />
        </div>
      </template>
    </q-tab>
  </q-tabs>
</template>

<style lang="scss" scoped>
.q-tabs {
  min-height: 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);

  .custom-tab {
    min-height: 32px;
    padding: 0 8px;
    color: #666;
    font-weight: 400;
    border-right: 1px solid rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease;
    min-width: auto;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
      
      .close-btn {
        opacity: 1;
      }
    }

    &.q-tab--active {
      color: var(--q-primary);
      background: #fff;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--q-primary);
      }
    }

    .close-btn {
      opacity: 0.5;
      transition: opacity 0.3s ease;
      margin-left: 4px;
      
      &:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.1);
      }
    }

    .tab-label {
      font-size: 12px;
      white-space: nowrap;
    }

    .q-icon {
      font-size: 16px;
    }
  }
}
</style>