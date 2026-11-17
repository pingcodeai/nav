import sharp from "sharp";
import { fileURLToPath } from "node:url";

await sharp(fileURLToPath(new URL("../public/og-image.svg", import.meta.url)))
  .png()
  .toFile(fileURLToPath(new URL("../public/og-image.png", import.meta.url)));
