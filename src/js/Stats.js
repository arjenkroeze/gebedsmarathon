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
        <div className="stats">
            <h2>Doe jij ook mee?</h2>
            <div className="progress">
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${percentageOccupied}%` }}
                    />
                    <div className="progress-bar-percentage">{percentageOccupied} %</div>
                </div>
            </div>
            <div className="stats-columns">
                <div className="stat">
                    <div className="stat-number">{hoursBusy}</div>
                    <div className="stat-sub">Uren Bezet</div>
                </div>
                <div className="stat">
                    <div className="stat-number">{registrations.length}</div>
                    <div className="stat-sub">Inschrijvingen</div>
                </div>
                <div className="stat">
                    <div className="stat-number">{numberOfHours - hoursBusy}</div>
                    <div className="stat-sub">Uren Beschikbaar</div>
                </div>
            </div>
        </div>
    )
}

export default Stats
