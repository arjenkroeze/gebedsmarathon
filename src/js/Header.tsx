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

    return (
        <header className="header">
            <div className="header-bar">Vrije Baptistengemeente Emmen</div>
            <h1>Gebedsmarathon</h1>
            <h2>
                {formattedStartDate} - {formattedEndDate}
            </h2>
        </header>
    )
}

export default Header
