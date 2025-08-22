import type { Translation } from "./directions.ts";

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  profileImage: string;
  translations: Translation[];
}

