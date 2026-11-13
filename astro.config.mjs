import { defineConfig } from "astro/config";
import climbPwa from "./src/integrations/pwa";

export default defineConfig({
  site: "https://juscxnn.github.io",
  integrations: [climbPwa()],
});
