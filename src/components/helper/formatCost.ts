export function formatCost(cost: number) {
    if (cost >= 100) {
        return `₹${(cost / 100).toFixed(2)} Cr`
    } else {
        return `₹${cost} Lacs`
    }
}

export function formatExactCostToLacsOrCrs(cost: number) {
    return formatCost(cost / 100000)
}
