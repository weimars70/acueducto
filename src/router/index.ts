import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTabsStore } from '../stores/tabs';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: () => import('../pages/DashboardPage.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('../components/DashboardHome.vue')
      },
      {
        path: '/consumptions',
        component: () => import('../pages/ConsumptionsPage.vue')
      },
      {
        path: '/consumptions/new',
        component: () => import('../pages/NewConsumptionPage.vue')
      },
      {
        path: '/consumptions/edit/:id',
        name: 'edit-consumption',
        component: () => import('../pages/EditConsumptionPage.vue'),
        props: true
      },
      {
        path: '/sync-data',
        component: () => import('../pages/SyncDataPage.vue')
      },
      {
        path: '/subsidies',
        component: () => import('../pages/SubsidiesPage.vue')
      },
      {
        path: '/sectores',
        component: () => import('../pages/generic-capture/SectorsPage.vue')
      },
      {
        path: '/tarifas',
        component: () => import('../pages/generic-capture/TarifasPage.vue')
      },
      {
        path: '/estratos',
        component: () => import('../pages/generic-capture/EstratosPage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const tabsStore = useTabsStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard');
    return;
  }

  // Add tab when navigating to a route
  if (to.path !== '/login' && to.path !== '/dashboard' && to.path !== '/') {
    const routeConfig = routes[2].children?.find(route => route.path === to.path);
    if (routeConfig) {
      // Get the menu item that corresponds to this route
      const menuItems = [
        { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', closable: false },
        { icon: 'show_chart', label: 'Consumos', route: '/consumptions', closable: true },
        { icon: 'storage', label: 'Datos Sincronizados', route: '/sync-data', closable: true },
        { icon: 'request_quote', label: 'Subsidios', route: '/subsidies', closable: true },
        { icon: 'location_city', label: 'Sectores', route: '/sectores', closable: true },
        { icon: 'payments', label: 'Tarifas', route: '/tarifas', closable: true },
        { icon: 'group_work', label: 'Estratos', route: '/estratos', closable: true },
        { icon: 'people', label: 'Usuarios', route: '/users', closable: true },
        { icon: 'settings', label: 'Configuración', route: '/settings', closable: true }
      ];
      
      const menuItem = menuItems.find(item => item.route === to.path);
      
      if (menuItem) {
        tabsStore.addTab({
          name: menuItem.label,
          route: menuItem.route,
          icon: menuItem.icon,
          closable: menuItem.closable
        });
      }
    }
  }

  next();
});

export default router;