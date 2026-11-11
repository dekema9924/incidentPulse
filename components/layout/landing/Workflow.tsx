// components/landing/Workflow.tsx
import SectionHeading from './SectionHeading'

const STEPS = [
    { title: 'Open', body: 'Describe what is happening and pick a severity.' },
    { title: 'Assign', body: 'An admin hands it to someone, or a member asks to take it.' },
    { title: 'Escalate', body: 'No response in time? Owners and admins are emailed automatically.' },
    { title: 'Resolve', body: 'Close it with a timeline that shows who did what, and when.' },
    { title: 'Review', body: 'Generate a postmortem draft from the timeline.', soon: true },
]

export default function Workflow() {
    return (
        <section id="how-it-works" className="scroll-mt-20 border-t border-[#262B36] bg-[#0b0d11]">
            <div className="mx-auto max-w-6xl px-4 py-20">
                <SectionHeading
                    eyebrow="How it works"
                    title="From the first alert to the last word"
                    description="The same five steps every time, so nobody has to remember the process mid-incident."
                />

                <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {STEPS.map((s, i) => (
                        <li key={s.title} className="rounded-xl border border-[#262B36] bg-[#15181F] p-5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#33477A] bg-[#243352] text-xs font-semibold text-[#A9C0FF]">
                                {i + 1}
                            </span>
                            <h3 className="mt-4 flex items-center gap-2 text-sm font-semibold">
                                {s.title}
                                {s.soon && (
                                    <span className="rounded-full border border-[#262B36] px-2 py-px text-[10px] font-medium text-[#868C9C]">
                                        Soon
                                    </span>
                                )}
                            </h3>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-[#868C9C]">{s.body}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}