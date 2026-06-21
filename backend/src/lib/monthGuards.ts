
type MonthModel = {
    findFirst: (args?: any) => Promise<any>;
};

export function prevMonth(monthBelongs: string): string {
    const [y, m] = monthBelongs.split('-').map(Number);
    const d = new Date(y, m - 2);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function nextMonth(monthBelongs: string): string {
    const [y, m] = monthBelongs.split('-').map(Number);
    const d = new Date(y, m);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function requireMonthExists(
    model: MonthModel,
    month: string,
    label: string,
): Promise<void> {
    const anyRecord = await model.findFirst();
    if (!anyRecord) return; // bootstrap: empty table, first entry is always free

    const exists = await model.findFirst({ where: { monthBelongs: month } });
    if (!exists) {
        const err: any = new Error(
            `No ${label} entries found for ${month}. Add ${label} data for ${month} first.`
        );
        err.statusCode = 422;
        throw err;
    }
}

export async function requireMonthAbsent(
    model: MonthModel,
    month: string,
    label: string,
): Promise<void> {
    const exists = await model.findFirst({ where: { monthBelongs: month } });
    if (exists) {
        const err: any = new Error(
            `${label} entries already exist for ${month}. Delete those first before removing this entry.`
        );
        err.statusCode = 422;
        throw err;
    }
}
