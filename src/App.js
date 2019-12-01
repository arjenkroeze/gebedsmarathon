import React from 'react'
import Week from './Week'

function App() {
    const startDate = new Date('2020-3-1')
    const endDate = new Date('2020-3-23')

    // Work with full weeks, so start the week always on a monday
    // Therefore we copy the startDate and change it to the monday before
    const startDateCopy = new Date(startDate)
    const startDateCopyDay = startDateCopy.getDay()
    const monday = 1

    if (startDateCopyDay !== monday) {
        const offset = startDateCopyDay === 0 ? 6 : startDateCopyDay - 1
        startDateCopy.setTime(startDateCopy.getTime() - 1000 * 60 * 60 * 24 * offset)
    }

    // Also copy the endDate and change it to the sunday after
    const endDateCopy = new Date(endDate)
    const endDateCopyDay = endDateCopy.getDay()
    const sunday = 0

    if (endDateCopyDay !== sunday) {
        const offset = {
            '1': 6,
            '2': 5,
            '3': 4,
            '4': 3,
            '5': 2,
            '6': 1,
        }

        endDateCopy.setTime(endDateCopy.getTime() + 1000 * 60 * 60 * 24 * offset[endDateCopyDay])
    }

    // Calculate the difference in days
    const numberOfDays = (endDateCopy.getTime() - startDateCopy.getTime()) / 1000 / 60 / 60 / 24

    // Sum up the weeks...
    const weeks = []

    for (let i = 0; i < numberOfDays; i++) {
        // Create a week for every 7 days...
        if (i % 7 === 0) {
            const weekStartDate = new Date(startDateCopy)
            weekStartDate.setTime(weekStartDate.getTime() + i * 1000 * 60 * 60 * 24)

            const weekEndDate = new Date(weekStartDate)
            weekEndDate.setTime(weekEndDate.getTime() + 1000 * 60 * 60 * 24 * 6)

            weeks.push(<Week key={i} startDate={weekStartDate} endDate={weekEndDate} />)
        }
    }

    return <>{weeks}</>
}

export default App
