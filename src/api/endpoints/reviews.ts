import {api} from "../api.ts";
import type {Review} from "../../types/reviews.ts";
import type {PageResponse} from "../../types/common.ts";

export const getAll = async (page = 0, size = 10): Promise<PageResponse<Review>> => {
    const response = await api.get('/reviews', {params: {page, size}});
    return response.data;
};

export const deleteReview = async (id: number): Promise<void> => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
};
