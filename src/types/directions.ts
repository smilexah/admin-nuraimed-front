export interface Translation {
  languageCode: string;
  title?: string;
  description?: string;
  offerDetails?: string;
  education?: string;
  experience?: string;
  serviceRecord?: string;
  specialization?: string;
}

export interface Direction {
  id: number;
  directionImage: string;
  translations: Translation[];
}


