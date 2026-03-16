// ============================================================
// CURRENCY DEFINITIONS AND FORMATTING
// Extracted from items.js. 3-tier currency system.
// ============================================================

// ========== 3-TIER CURRENCY ==========
const CURRENCY = {
    gold: { name: 'Złoto', color: '#f1c40f', value: 1 },
    platinum: { name: 'Platyna', color: '#bdc3c7', value: 100 },
    crystal: { name: 'Kryształ', color: '#9b59b6', value: 10000 },
};

function formatCurrency(goldAmount) {
    if (goldAmount >= 10000) {
        const crystals = Math.floor(goldAmount / 10000);
        const remainder = goldAmount % 10000;
        const plat = Math.floor(remainder / 100);
        const gold = remainder % 100;
        let parts = [];
        if (crystals > 0) parts.push(`${crystals}cc`);
        if (plat > 0) parts.push(`${plat}pp`);
        if (gold > 0) parts.push(`${gold}gp`);
        return parts.join(' ') || '0gp';
    }
    if (goldAmount >= 100) {
        const plat = Math.floor(goldAmount / 100);
        const gold = goldAmount % 100;
        return plat > 0 && gold > 0 ? `${plat}pp ${gold}gp` : plat > 0 ? `${plat}pp` : `${gold}gp`;
    }
    return `${goldAmount}gp`;
}
