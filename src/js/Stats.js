import React, { useContext, useEffect, useState } from 'react'
import AppContext from './context/AppContext'

const Stats = () => {
    const { startDate, endDate, registrations } = useContext(AppContext)
    const [hoursBusy, setHoursBusy] = useState(0)
    const numberOfHours = Math.abs(startDate - endDate) / 36e5

    const formattedStartDate = new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(startDate)

    const formattedEndDate = new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(endDate)

    // Effect to calculate the number of busy hours
    useEffect(() => {
        const uniqueDates = []
        const uniqueRegistrations = registrations.reduce((hoursBusy, registration) => {
            const registrationDate = new Date(registration.date.seconds * 1000).getTime()

            if (!uniqueDates.includes(registrationDate)) {
                uniqueDates.push(registrationDate)
                hoursBusy++
            }

            return hoursBusy
        }, 0)

        setHoursBusy(uniqueRegistrations)
    }, [registrations])

    return (
        <dl>
            <dt>Datum</dt>
            <dd>
                {formattedStartDate} - {formattedEndDate}
            </dd>
            <dt>Uren</dt>
            <dd>
                {hoursBusy} van de {numberOfHours} uren bezet
            </dd>
            <dt>Inschrijvingen</dt>
            <dd>{registrations.length}</dd>
        </dl>
    )
}

export default Stats
