import {api} from '../api';
import type {Review} from '../../types/reviews';
import type {PageResponse} from '../../types/common';

export const getAll = async (page = 0, size = 10): Promise<PageResponse<Review>> => {
    const response = await api.get('/reviews/admin', {params: {page, size}});
    return response.data;
};

export const deleteReview = async (id: number): Promise<void> => {
    return await api.delete(`/reviews/${id}`);};

export const updateReviewStatus = async (id: number, isPublished: boolean): Promise<void> => {
    return await api.patch(`/reviews/${id}`, { isPublished });
};
