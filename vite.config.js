import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        dashboard: resolve(__dirname, "src/pages/index.html"),
        attendance: resolve(__dirname, "src/pages/attendance.html"),
        editor: resolve(__dirname, "src/pages/editor.html"),
        resultManager: resolve(__dirname, "src/pages/result-manager.html"),
        settings: resolve(__dirname, "src/pages/settings.html"),
        student: resolve(__dirname, "src/pages/student.html"),
        subject: resolve(__dirname, "src/pages/subject.html"),
      },
    },
  },
});
