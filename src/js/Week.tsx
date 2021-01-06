import React, { FC, useContext } from 'react'
import { WeekProps } from '../types'
import AppContext from './context/AppContext'
import Hour from './Hour'

const Week: FC<WeekProps> = (props) => {
    const {
        startDate,
        endDate,
        dailyStartHour,
        dailyEndHour,
        weeklyStartDay,
        weeklyEndDay,
        registrations,
    } = useContext(AppContext)

    // Array to store the title of the days
    const dayTitles = [
        <th key="0" className="week-cell-header">
            Week {props.weekNumber}
        </th>,
    ]

    // For every day of the week...
    for (let x = 0; x < 7; x++) {
        // Create the day's date
        const dayDate = new Date(props.startDate)
        dayDate.setHours(0)
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
                {dayDate.getTime() < endDate.getTime() ? formattedDayDate : null}
            </th>
        )
    }

    // Array to store the hours
    let hours = []

    // For every hour in a day...
    for (let i = dailyStartHour; i <= dailyEndHour; i++) {
        // Create a new date that will increase by the hour
        const hourDate = new Date(props.startDate).setHours(i)

        // Array to store the days
        let days = []

        // Every day starts with a cell that contains the hour notation
        days.push(
            <td key={i} className="week-hour">
                {i}.00 - {i + 1}.00
            </td>
        )

        // For every day in a week...
        for (let j = weeklyStartDay; j <= weeklyEndDay; j++) {
            // Create the day date which is derived from the hour date
            const datetime = new Date(hourDate)
            datetime.setDate(datetime.getDate() + j)

            // Find registrations on this date
            const filteredRegistrations = registrations.filter((registration) => {
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

            const hourIsDisabled =
                startDate.getTime() > datetime.getTime() ||
                endDate.getTime() < datetime.getTime() ||
                datetime.getHours() < dailyStartHour ||
                datetime.getHours() > dailyEndHour ||
                datetime.getHours() === 17 || // Disable the 17th hour
                datetime.getHours() === 18 // Disable the 18th hour

            // Render a column for every day
            days.push(
                <Hour
                    key={datetime.getTime()}
                    datetime={datetime}
                    isActive={now > datetime.getTime() && now < datetime.getTime() + 3600000}
                    isDisabled={hourIsDisabled}
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
    if (props.endDate.getTime() < Date.now() || endDate.getTime() <= Date.now()) {
        return null
    }

    return (
        <div className={`week-wrapper ${props.isLoading ? `is-loading` : ``}`}>
            <table className="week">
                <thead className="week-header">
                    <tr>{dayTitles}</tr>
                </thead>
                <tbody className="week-body">{hours}</tbody>
            </table>
        </div>
    )
}

export default Week
