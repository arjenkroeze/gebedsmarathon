import React, { FC, useContext, useEffect, useState } from 'react'
import AppContext from './context/AppContext'

const Stats: FC<{ isLoading: boolean }> = ({ isLoading }) => {
    const { startDate, endDate, registrations } = useContext(AppContext)
    const [hoursBusy, setHoursBusy] = useState(0)
    const numberOfHours = Math.abs(startDate.getTime() - endDate.getTime()) / 36e5

    // Effect to calculate the number of busy hours
    useEffect(() => {
        const uniqueDates: number[] = []
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

    const percentageOccupied = Math.ceil((hoursBusy / numberOfHours) * 100)

    return (
        <div className="progress">
            {isLoading ? (
                <div className="spinner"></div>
            ) : (
                <>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${percentageOccupied}%` }}
                        />
                    </div>
                    <div className="progress-status">
                        {hoursBusy} / {numberOfHours} uren bezet ({percentageOccupied}%)
                    </div>
                </>
            )}
        </div>
    )
}

export default Stats
