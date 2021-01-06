import React, { useContext } from 'react'
import AppContext from './context/AppContext'

const Header = () => {
    // Context
    const { startDate, endDate } = useContext(AppContext)

    const formattedStartDate = new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
    }).format(startDate)

    const formattedEndDate = new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(endDate)

    console.log(endDate.getTime() < Date.now())

    return (
        <header className={`header ${endDate.getTime() <= Date.now() ? `has-ended` : ``}`}>
            <div className="header-bar">Stadskerk Emmen</div>
            <h1>Gebedsrooster</h1>
            {endDate.getTime() > Date.now() ? (
                <h2>
                    {formattedStartDate} - {formattedEndDate}
                </h2>
            ) : (
                <>
                    <h2>Bedankt voor je deelname in 2020.</h2>
                    <p>
                        Ga naar <a href="http://www.stadskerkemmen.nl">www.stadskerkemmen.nl</a>
                    </p>
                </>
            )}
        </header>
    )
}

export default Header
