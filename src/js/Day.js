import React, { useContext } from 'react'
import AppContext from './context/AppContext'
import WeekContext from './context/WeekContext'

const Day = ({ date, hour, registrations = [] }) => {
    const { startDate, endDate, setModal } = useContext(AppContext)
    const { setHover } = useContext(WeekContext)
    const classNames = ['week-cell', registrations.length > 0 ? 'bg-yellow' : 'bg-green']

    // Render cells outside the startDate and endDate
    if (startDate.getTime() > date.getTime() || endDate.getTime() < date.getTime()) {
        return <td key={hour} className="week-cell bg-light"></td>
    }

    // Render the registrations
    const registrationNames = registrations.map((registration, i) => (
        <div key={i} className="registration">
            {registration.name}
        </div>
    ))

    return (
        <td
            className={classNames.join(' ')}
            onMouseEnter={() => setHover(hour)}
            onMouseLeave={() => setHover(-1)}
            onClick={() => setModal(true)}
        >
            {registrationNames}
        </td>
    )
}

export default Day
