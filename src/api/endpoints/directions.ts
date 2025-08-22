import {api} from "../api.ts";
import type {Direction} from "../../types/directions.ts";
import type {PageResponse} from "../../types/common.ts";

export const getAll = async (page = 0, size = 10): Promise<PageResponse<Direction>> => {
    const response = await api.get('/directions', {params: {page, size}});
    return response.data;
};

export const getById = async (id: number): Promise<Direction> => {
    const response = await api.get(`/directions/${id}`);
    return response.data;
};

export const create = async (data: FormData): Promise<Direction> => {
    const response = await api.post('/directions', data, {
        headers: {'Content-Type': 'multipart/form-data'}
    });
    return response.data;
};

export const update = async (id: number, data: FormData): Promise<Direction> => {
    const response = await api.put(`/directions/${id}`, data, {
        headers: {'Content-Type': 'multipart/form-data'}
    });
    return response.data;
};

export const deleteDirection = async (id: number): Promise<void> => {
    const response = await api.delete(`/directions/${id}`);
    return response.data;
};
