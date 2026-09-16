
type buttonType = {
    text: string
    className: string
}


export default function Button({ text, className }: buttonType) {

    return (
        <button className={`bg-[#22335c]  cursor-pointer rounded-md ${className}`}>
            {text}
        </button>
    )
}
