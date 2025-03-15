import { ref, onMounted, onUnmounted } from 'vue';

export function useScreenSize() {
  const isMobile = ref(false);
  
  const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 768;
  };
  
  onMounted(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize);
  });
  
  return {
    isMobile
  };
}