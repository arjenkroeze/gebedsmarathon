import React, { useContext } from 'react'
import AppContext from './context/AppContext'

const Header = () => {
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
        <header className="main-header">
            <h1>Gebedsmarathon</h1>
            <h2>
                {formattedStartDate} - {formattedEndDate}
            </h2>
            <button className="button button-primary">Direct inschrijven</button>
        </header>
    )
}

export default Header
