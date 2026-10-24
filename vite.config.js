import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        step1: resolve(__dirname, 'step-1-event-basics.html'),
        step2Planner: resolve(__dirname, 'step-2-planner-details.html'),
        step2Performer: resolve(__dirname, 'step-2-performer-details.html'),
        step2Crew: resolve(__dirname, 'step-2-crew-details.html'),
        step3Planner: resolve(__dirname, 'step-3-planner-preferences.html'),
        step3Performer: resolve(__dirname, 'step-3-performer-preferences.html'),
        step4Review: resolve(__dirname, 'step-4-review-publish.html')
      }
    }
  }
});
