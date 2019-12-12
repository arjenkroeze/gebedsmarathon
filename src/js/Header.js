import React, { useContext } from 'react'
import AppContext from './context/AppContext'
import Stats from './Stats'

const Header = () => {
    const { startDate, endDate } = useContext(AppContext)

    const dateFormat = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }

    const formattedStartDate = new Intl.DateTimeFormat('nl-NL', dateFormat).format(startDate)
    const formattedEndDate = new Intl.DateTimeFormat('nl-NL', dateFormat).format(endDate)

    return (
        <header className="main-header">
            {/* <h1>Gebedsmarathon</h1> */}
            {/* <h2>
                {formattedStartDate} - {formattedEndDate}
            </h2> */}
            <Stats />
        </header>
    )
}

export default Header
