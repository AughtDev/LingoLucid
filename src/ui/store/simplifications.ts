
let simplifications: string[] = []

export function getSimplifications(): string[] {
    return simplifications
}

export function updateSimplifications(new_simplification: string) {
    if (!simplifications.includes(new_simplification)) {
        simplifications.push(new_simplification)
    }
}

export function clearSimplifications() {
    simplifications = []
}
