export interface IAuthRequest {
    username: string;
    password: string;
}

export interface IAuthResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
}
