import React, { useContext, useState } from 'react'
import AppContext from './context/AppContext'
import WeekContext from './context/WeekContext'
import Day from './Day'

function Week({ startDate, endDate }) {
    const { registrations } = useContext(AppContext)
    const [hover, setHover] = useState(-1)

    let dayHeaders = []

    for (let x = 0; x < 7; x++) {
        const dayDate = new Date(startDate)
        dayDate.setDate(dayDate.getDate() + x)

        dayHeaders.push(
            <th key={dayDate.getTime()} className="week-cell-header">
                {new Intl.DateTimeFormat('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                }).format(dayDate)}
            </th>
        )
    }

    let hours = []

    // For every hour in a day...
    for (let i = 0; i < 24; i++) {
        // Set the date's hour
        const date = new Date(startDate).setHours(i)

        let days = []

        // Render table cells for the first column
        days.push(
            <td key={i} className={`week-hour${hover === i ? ` bg-light` : ``}`}>
                {i}.00 - {i + 1}.00
            </td>
        )

        // For every day in a week...
        for (let j = 0; j < 7; j++) {
            // Set the day
            const dayDate = new Date(date)
            dayDate.setDate(dayDate.getDate() + j)

            // Find the registration
            const filteredRegistrations = registrations.filter(registration => {
                const registrationDate = new Date(registration.date.seconds * 1000)
                return registrationDate.getTime() === dayDate.getTime() ? registrationDate : null
            })

            // Render a column for every day
            days.push(<Day key={dayDate.getTime()} date={dayDate} hour={i} registrations={filteredRegistrations} />)
        }

        // Render a row for every hour
        hours.push(<tr key={i}>{days}</tr>)
    }

    return (
        <WeekContext.Provider value={{ setHover }}>
            <h2 className="text-center">
                {new Intl.DateTimeFormat('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                }).format(startDate)}{' '}
                -{' '}
                {new Intl.DateTimeFormat('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                }).format(endDate)}
            </h2>
            <table className="week">
                <thead className="week-header">
                    <tr>
                        <th></th>
                        {dayHeaders}
                    </tr>
                </thead>
                <tbody className="week-body">{hours}</tbody>
            </table>
        </WeekContext.Provider>
    )
}

export default Week
