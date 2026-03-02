import './style.css';
import './fonts/ys-display/fonts.css';

import { data as sourceData } from "./data/dataset_1.js";
import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

const api = initData(sourceData);

function collectState() {
    const form = document.querySelector('form[name="table"]');
    if (!form) return { rowsPerPage: 10, page: 1 };
    
    const state = processFormData(new FormData(form));
    const rowsPerPage = parseInt(state.rowsPerPage) || 10;
    const page = parseInt(state.page) || 1;
    return { ...state, rowsPerPage, page };
}

async function render(action) {
    try {
        let state = collectState();
        let query = {};

        query = applySearching(query, state, action);
        query = applyFiltering(query, state, action);
        query = applySorting(query, state, action);
        query = applyPagination(query, state, action);

        const { total, items } = await api.getRecords(query);
        updatePagination(total, query);
        sampleTable.render(items);
    } catch (error) {
        console.error('Render error:', error);
    }
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const applySearching = initSearching('search');

const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        if (input && label) {
            input.value = page;
            input.checked = isCurrent;
            label.textContent = page;
        }
        return el;
    }
);

async function init() {
    try {
        const indexes = await api.getIndexes();
        if (sampleTable.filter && sampleTable.filter.elements) {
            updateIndexes(sampleTable.filter.elements, {
                searchBySeller: indexes.sellers
            });
        }
        await render();
    } catch (error) {
        console.error('Init error:', error);
    }
}

init();

const appRoot = document.querySelector('#app');
if (appRoot && sampleTable.container) {
    appRoot.appendChild(sampleTable.container);
}