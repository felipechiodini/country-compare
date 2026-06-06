export { brazilCLT } from "./brazil-clt";
export { brazilPJ } from "./brazil-pj";
export { irelandPAYE } from "./ireland-paye";

import { brazilCLT } from "./brazil-clt";
import { brazilPJ } from "./brazil-pj";
import { irelandPAYE } from "./ireland-paye";
import { CountryConfig } from "../types";

// Para adicionar um novo país: crie lib/countries/<país>.ts e adicione aqui.
export const COUNTRIES: CountryConfig[] = [
  brazilCLT,
  brazilPJ,
  irelandPAYE,
];
