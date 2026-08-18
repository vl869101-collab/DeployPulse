import { globalIgnores } from "eslint/config";
import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    // ponytail: react-hooks v6 strict rules flag legacy TanStack/forms code;
    // re-enable per-file when refactored to compiler-safe patterns
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
  globalIgnores([".next/**", "node_modules/**", "prisma/**", "public/**"]),
];

export default eslintConfig;