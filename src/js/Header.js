import React, { useContext } from 'react'
import AppContext from './context/AppContext'
import { useAuth } from './utilities/hooks'

const Header = () => {
    // Auth
    const auth = useAuth()

    // Context
    const { startDate, endDate, setModal } = useContext(AppContext)

    const formattedStartDate = new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
    }).format(startDate)

    const formattedEndDate = new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(endDate)

    const [firstName] = auth.user && auth.user.displayName ? auth.user.displayName.split('|') : ['']

    return (
        <header className="header">
            <div className="header-bar">
                <p>Vrije Baptistengemeente Emmen</p>
                {!auth.user ? (
                    <button onClick={() => setModal('signin')}>Inloggen</button>
                ) : (
                    <p>
                        {auth.user ? <span>Welkom, {firstName}</span> : ''}
                        <button onClick={async () => await auth.signout()}>(uitloggen)</button>
                    </p>
                )}
            </div>
            <h1>Gebedsmarathon</h1>
            <h2>
                {formattedStartDate} - {formattedEndDate}
            </h2>
        </header>
    )
}

export default Header
