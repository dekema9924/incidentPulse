
export const slugify = (value: string, maxLength = 40) =>
    value
        .normalize('NFD')                 // splits "é" into "e" + an accent mark
        .replace(/[\u0300-\u036f]/g, '')  // removes the accent marks
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')      // anything else becomes a single dash
        .replace(/^-+|-+$/g, '')          // no leading or trailing dashes
        .slice(0, maxLength)
        .replace(/-+$/g, '')              // slicing can leave a trailing dash




// org and inviter names are typed by users, so they must be escaped before going into HTML
export const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')




// for the subject line and plain-text body: no line breaks allowed

export const singleLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim()
