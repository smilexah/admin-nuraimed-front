export interface IAuthRequest {
    username: string;
    password: string;
}

export interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
}
