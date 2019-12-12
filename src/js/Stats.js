import React, { useContext, useEffect, useState } from 'react'
import AppContext from './context/AppContext'

const Stats = () => {
    const { startDate, endDate, registrations } = useContext(AppContext)
    const [hoursBusy, setHoursBusy] = useState(0)
    const numberOfHours = Math.abs(startDate - endDate) / 36e5

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

    const percentageOccupied = Math.floor((hoursBusy / numberOfHours) * 100)

    return (
        <div className="progress">
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${percentageOccupied}%` }} />
            </div>
            Er zijn {hoursBusy} van de {numberOfHours} uren bezet ({percentageOccupied}%)
        </div>
    )
}

export default Stats
