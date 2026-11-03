
type buttonType = {
    text: string
    className?: string
    onClick?: () => void
}


export default function Button({ text, className, onClick }: buttonType) {

    return (
        <button onClick={onClick} className={`bg-[#22335c]  cursor-pointer rounded-md ${className}`}>
            {text}
        </button>
    )
}
