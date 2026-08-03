import fs from 'fs';
import { execSync } from 'child_process';

try {
  const out = execSync('npx tsc --noEmit', { encoding: 'utf-8', stdio: 'pipe' });
  console.log("No TS errors!");
} catch (e) {
  console.log("TS Errors:\n", e.stdout?.toString() || e.message);
}
