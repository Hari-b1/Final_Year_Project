export default function Button({ label, onClick }) {
    return (
        <button className='btn btn-primary' onClick={onClick}>{ label }</button>
    )
}