import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  timeout: 30000,
  reporter: null,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
