export function initSearching(searchField) {
    return (query, state, action) => {
        if (state[searchField]) {
            return { ...query, search: state[searchField] };
        }
        return query;
    };
}