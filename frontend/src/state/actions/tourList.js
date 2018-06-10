import TourService from "../../services/TourService";

export function changeFilters(data) {
    return {
        type: 'FILTERS_CHANGED',
        payload: data
    }
}

export function fetchTours(data) {
    return {
        type: 'FETCH_TOURS',
        payload: TourService.getTours()
    }
}