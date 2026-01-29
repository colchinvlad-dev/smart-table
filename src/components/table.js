import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // @todo: #1.2 — вывести дополнительные шаблоны до и после таблицы
    // Шаблоны "до" в обратном порядке
    before.reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    // Шаблоны "после"
    after.forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    // @todo: #1.3 — обработать события и вызвать onAction()
    root.container.addEventListener('change', () => onAction());
    root.container.addEventListener('reset', () => setTimeout(onAction));
    root.container.addEventListener('submit', e => {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);
            
            Object.keys(item).forEach(key => {
                if (row.elements[key]) {
                    // Проверяем тип элемента для правильного присвоения значения
                    if (row.elements[key].tagName === 'INPUT' || 
                        row.elements[key].tagName === 'SELECT') {
                        row.elements[key].value = item[key];
                    } else {
                        row.elements[key].textContent = item[key];
                    }
                }
            });
            
            return row.container;
        });
        
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}