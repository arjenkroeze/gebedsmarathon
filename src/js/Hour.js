import React, { useContext, useEffect, useState } from 'react'
import AppContext from './context/AppContext'

const Hour = ({ datetime, registrations = [] }) => {
    const { startDate, endDate, setModal } = useContext(AppContext)
    const [classNames, setClassNames] = useState(['week-cell'])

    useEffect(() => {
        const now = Date.now()

        // Render cells outside the startDate and endDate
        if (startDate.getTime() > datetime.getTime() || endDate.getTime() < datetime.getTime()) {
            setClassNames(state => [...state, 'is-unavailable'])
            return
        }

        if (registrations.length > 0) {
            setClassNames(state => [...state, 'is-registered'])
        } else {
            setClassNames(state => [...state, 'is-available'])
        }

        if (now > datetime.getTime() + 3600000) {
            setClassNames(state => [...state, 'is-history'])
        }

        if (now > datetime.getTime() && now < datetime.getTime() + 3600000) {
            setClassNames(state => [...state, 'is-active'])
        }
    }, [datetime, startDate, endDate, registrations])

    return (
        <td
            className={classNames.join(' ')}
            onClick={() => (!classNames.includes('is-history') ? setModal(true) : null)}
        >
            {registrations.length > 0 && (
                <Registration name={registrations[0].name} count={registrations.length} />
            )}
        </td>
    )
}

const Registration = ({ name, count }) => (
    <div className="registration">
        <div className="registration-name">{name}</div>
        {count > 1 && <div className="registration-count">en nog {count - 1}</div>}
    </div>
)

export default Hour
