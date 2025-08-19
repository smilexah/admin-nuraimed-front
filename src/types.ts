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

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  profileImage: string;
  translations: Translation[];
}

export interface Review {
  id: number;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Sort {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface Pageable {
  offset: number;
  sort: Sort[];
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}

export interface PageResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  sort: Sort[];
  numberOfElements: number;
  first: boolean;
  last: boolean;
  pageable: Pageable;
  empty: boolean;
}
