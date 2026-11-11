'use client'

type PaginationProps = {
    page: number                       // current page, starting at 1
    pageCount: number
    onPageChange: (page: number) => void
    totalItems?: number                // optional: enables the "Showing 1–10 of 23" text
    pageSize?: number                  // needed together with totalItems
    className?: string
}

type PageItem = number | 'gap-left' | 'gap-right'

// 1 … 4 5 6 … 12: always the first, last, and the current page with one neighbor on each side
function getPages(page: number, count: number): PageItem[] {
    if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)

    const pages: PageItem[] = [1]
    const start = Math.max(2, page - 1)
    const end = Math.min(count - 1, page + 1)

    if (start > 2) pages.push('gap-left')
    for (let p = start; p <= end; p++) pages.push(p)
    if (end < count - 1) pages.push('gap-right')
    pages.push(count)

    return pages
}

const btn =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B8DEF] disabled:cursor-not-allowed disabled:opacity-40'

export default function Pagination({
    page,
    pageCount,
    onPageChange,
    totalItems,
    pageSize,
    className = '',
}: PaginationProps) {
    if (pageCount <= 1) return null // nothing to page through

    const from = totalItems && pageSize ? (page - 1) * pageSize + 1 : null
    const to = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : null

    return (
        <nav
            aria-label="Pagination"
            className={`flex flex-col items-center justify-between gap-3 text-xs text-[#868C9C] sm:flex-row ${className}`}
        >
            <p>
                {from !== null && to !== null
                    ? `Showing ${from}–${to} of ${totalItems}`
                    : `Page ${page} of ${pageCount}`}
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className={`${btn} border-[#262B36] bg-[#1B1F28] text-white hover:border-[#3a4152]`}
                >
                    Previous
                </button>

                {/* page numbers: hidden on phones, where "Page X of Y" plus Previous/Next is enough */}
                <div className="hidden items-center gap-1 sm:flex">
                    {getPages(page, pageCount).map(item =>
                        typeof item === 'string' ? (
                            <span key={item} className="px-1 text-[#565C6B]">…</span>
                        ) : (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onPageChange(item)}
                                aria-current={item === page ? 'page' : undefined}
                                className={`${btn} ${item === page
                                        ? 'border-[#33477A] bg-[#243352] text-white'
                                        : 'border-transparent hover:bg-[#1B1F28] hover:text-white'
                                    }`}
                            >
                                {item}
                            </button>
                        )
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= pageCount}
                    className={`${btn} border-[#262B36] bg-[#1B1F28] text-white hover:border-[#3a4152]`}
                >
                    Next
                </button>
            </div>
        </nav>
    )
}