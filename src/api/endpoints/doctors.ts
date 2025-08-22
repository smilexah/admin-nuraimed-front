import {api} from "../api.ts";
import type {Doctor} from "../../types/doctors.ts";
import type {PageResponse} from "../../types/common.ts";

export const getAll = async (page = 0, size = 10): Promise<PageResponse<Doctor>> => {
    const response = await api.get('/doctors', {params: {page, size}});
    return response.data;
};

export const getById = async (id: number): Promise<Doctor> => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
};

export const create = async (data: FormData): Promise<Doctor> => {
    const response = await api.post('/doctors', data, {
        headers: {'Content-Type': 'multipart/form-data'}
    });
    return response.data;
};

export const update = async (id: number, data: FormData): Promise<Doctor> => {
    const response = await api.put(`/doctors/${id}`, data, {
        headers: {'Content-Type': 'multipart/form-data'}
    });
    return response.data;
};

export const deleteDoctor = async (id: number): Promise<void> => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
};
