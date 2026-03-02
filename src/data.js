import { makeIndex } from "./lib/utils.js";

export function initData(sourceData) {
    const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers ? sellers[item.seller_id] : '',
        customer: customers ? customers[item.customer_id] : '',
        total: item.total_amount
    }));

    const getIndexes = async () => {
        if (!sellers || !customers) {
            try {
                [sellers, customers] = await Promise.all([
                    fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                    fetch(`${BASE_URL}/customers`).then(res => res.json()),
                ]);
            } catch (error) {
                console.error('Error fetching indexes:', error);
                // Fallback to local data
                sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
                customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);
            }
        }
        return { sellers, customers };
    };

    const getRecords = async (query = {}, isUpdated = false) => {
        try {
            const qs = new URLSearchParams(query);
            const nextQuery = qs.toString();

            if (lastQuery === nextQuery && !isUpdated && lastResult) {
                return lastResult;
            }

            const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
            const records = await response.json();

            // Ensure we have indexes
            if (!sellers || !customers) {
                await getIndexes();
            }

            lastQuery = nextQuery;
            lastResult = {
                total: records.total || 0,
                items: records.items ? mapRecords(records.items) : []
            };

            return lastResult;
        } catch (error) {
            console.error('Error fetching records:', error);
            // Fallback to local data
            const sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
            const customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);
            const data = sourceData.purchase_records.map(item => ({
                id: item.receipt_id,
                date: item.date,
                seller: sellers[item.seller_id],
                customer: customers[item.customer_id],
                total: item.total_amount
            }));
            return {
                total: data.length,
                items: data
            };
        }
    };

    return {
        getIndexes,
        getRecords
    };
}