import React from 'react'
import Day from './Day'

function Week({ startDate, endDate }) {
    let hours = []

    for (let i = 0; i < 24; i++) {
        hours.push(
            <li key={i}>
                {i}:00 - {i + 1}:00
            </li>
        )
    }

    let days = []

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate)
        dayDate.setDate(dayDate.getDate() + i)
        days.push(<Day key={i} date={dayDate} />)
    }

    return (
        <div className="week">
            {`Start: ${startDate.toLocaleDateString()}`}
            <br />
            {`End: ${endDate.toLocaleDateString()}`}
            <ul className="week-header">
                <li>Maandag</li>
                <li>Dinsdag</li>
                <li>Woensdag</li>
                <li>Donderdag</li>
                <li>Vrijdag</li>
                <li>Zaterdag</li>
                <li>Zondag</li>
            </ul>
            <ul className="week-sidebar">{hours}</ul>
            <div className="week-content">{days}</div>
        </div>
    )
}

export default Week
