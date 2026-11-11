// components/landing/SectionHeading.tsx
type Props = { eyebrow: string; title: string; description?: string }

export default function SectionHeading({ eyebrow, title, description }: Props) {
    return (
        <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5B8DEF]">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            {description && (
                <p className="mt-3 text-sm leading-relaxed text-[#868C9C] sm:text-base">{description}</p>
            )}
        </div>
    )
}