export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const select = elements[elementName];
            // Очищаем все опции, кроме первой (placeholder)
            while (select.options.length > 1) {
                select.remove(1);
            }
            Object.values(indexes[elementName]).forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
            });
        });
    };

    const applyFiltering = (query, state, action) => {
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            const parent = action.closest('.filter-wrapper');
            if (parent) {
                const input = parent.querySelector('input, select');
                if (input) {
                    input.value = '';
                    state[field] = '';
                }
            }
        }

        const filter = {};
        Object.keys(elements).forEach(key => {
            const el = elements[key];
            if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT') && el.value) {
                filter[`filter[${el.name}]`] = el.value;
            }
        });

        return Object.keys(filter).length ? { ...query, ...filter } : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}