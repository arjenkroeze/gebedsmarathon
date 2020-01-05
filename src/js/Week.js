import React, { useContext, useState } from 'react'
import AppContext from './context/AppContext'
import WeekContext from './context/WeekContext'
import Hour from './Hour'

function Week(props) {
    const { startDate, endDate, registrations } = useContext(AppContext)
    const [hover, setHover] = useState(-1)

    // Array to store the title of the days
    const dayTitles = [<th key="0"></th>]

    // For every day of the week...
    for (let x = 0; x < 7; x++) {
        // Create the day's date
        const dayDate = new Date(props.startDate)
        dayDate.setDate(dayDate.getDate() + x)

        // Use the Intl API to format
        const formattedDayDate = new Intl.DateTimeFormat('nl-NL', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
        }).format(dayDate)

        // Add to the array
        dayTitles.push(
            <th key={dayDate.getTime()} className="week-cell-header">
                {formattedDayDate}
            </th>
        )
    }

    const formattedStartDate = new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
    }).format(props.startDate)

    const formattedEndDate = new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
    }).format(props.endDate)

    // Array to store the hours
    let hours = []

    // For every hour in a day...
    for (let i = 0; i < 24; i++) {
        // Create a new date that will increase by the hour
        const hourDate = new Date(props.startDate).setHours(i)

        // Array to store the days
        let days = []

        // Every day starts with a cell that contains the hour notation
        days.push(
            <td key={i} className={`week-hour${hover === i ? ` bg-light` : ``}`}>
                {i}.00 - {i + 1}.00
            </td>
        )

        // For every day in a week...
        for (let j = 0; j < 7; j++) {
            // Create the day date which is derived from the hour date
            const datetime = new Date(hourDate)
            datetime.setDate(datetime.getDate() + j)

            // Find registrations on this date
            const filteredRegistrations = registrations.filter(registration => {
                // Time is stored in the Firestore by seconds.
                // Multiply by 1000 to create a date in milliseconds.
                const registrationDate = new Date(registration.date.seconds * 1000)
                // Return the date if a match is found, else filter
                return registrationDate.getTime() === datetime.getTime() ? registrationDate : false
            })

            // Registrant's name
            const registrant = filteredRegistrations.length > 0 ? filteredRegistrations[0].name : ''

            // Date to check if the Hour is history or not
            const now = Date.now()

            // Render a column for every day
            days.push(
                <Hour
                    key={datetime.getTime()}
                    datetime={datetime}
                    isActive={now > datetime.getTime() && now < datetime.getTime() + 3600000}
                    isDisabled={
                        startDate.getTime() > datetime.getTime() ||
                        endDate.getTime() < datetime.getTime()
                    }
                    isHistory={now > datetime.getTime() + 3600000}
                    registrant={registrant}
                    registrationsCount={filteredRegistrations.length}
                />
            )
        }

        // Render a row for every hour
        hours.push(<tr key={i}>{days}</tr>)
    }

    // Hide the week if it's history...
    if (props.endDate.getTime() < Date.now()) {
        return null
    }

    return (
        <WeekContext.Provider value={{ setHover }}>
            {/* <h2 className="text-center">{`${formattedStartDate} - ${formattedEndDate}`}</h2> */}
            <table className="week">
                <thead className="week-header">
                    <tr>{dayTitles}</tr>
                </thead>
                <tbody className="week-body">{hours}</tbody>
            </table>
        </WeekContext.Provider>
    )
}

export default Week
