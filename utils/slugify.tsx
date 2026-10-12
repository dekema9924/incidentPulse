
export const slugify = (value: string, maxLength = 40) =>
    value
        .normalize('NFD')                 // splits "é" into "e" + an accent mark
        .replace(/[\u0300-\u036f]/g, '')  // removes the accent marks
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')      // anything else becomes a single dash
        .replace(/^-+|-+$/g, '')          // no leading or trailing dashes
        .slice(0, maxLength)
        .replace(/-+$/g, '')              // slicing can leave a trailing dash