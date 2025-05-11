export default function Header() {
    return (
        <div className='container'>
            <div className='container'>
                <h1 className='text-center'>App Stream</h1>
            </div>
            <div className='container navbar navbar-expand-lg navbar-light bg-light d-flex justify-content-between'>
                <div className='nav navbar-nav'>
                    <ul className='nav'>
                        <li className='nav-item'>
                            <a className='nav-link' href='/'>Home</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' href='/stream'>Stream</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' href='/meet'>Meet</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' href='/view'>Watch</a>
                        </li>
                    </ul>
                </div>
                <div className='nav navbar-nav'>
                    <ul className = 'nav position'>
                            <li className='nav-item'>
                                <a className='nav-link' href='/'>login</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link' href='/'>signup</a>
                            </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}