export function isNotEmpty<INote>(item: INote | undefined | null): item is INote { 
    return item !== null && item !== undefined
}