import React from 'react'
import Hour from './Hour'

const Day = ({ date }) => {
    const days = []

    for (let i = 0; i < 24; i++) {
        days.push(<Hour key={i} date={date} hour={i} />)
    }

    return <ul className="week-day">{days}</ul>
}

export default Day
