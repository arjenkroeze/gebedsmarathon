import classNames from 'classnames'
import React, { useContext } from 'react'
import { HourProps } from '../types'
import AppContext from './context/AppContext'

const Hour: React.FC<HourProps> = ({
    datetime,
    isActive,
    isDisabled,
    isHistory,
    registrant = '',
    registrationsCount,
}) => {
    const { setSelectedDate, setModal } = useContext(AppContext)
    const classes = classNames(
        'week-cell',
        registrationsCount ? 'is-registered' : 'is-available',
        isHistory ? 'is-history' : false,
        isActive ? 'is-active' : false
    )

    if (isDisabled) {
        return <td className="week-cell is-unavailable"></td>
    }

    const handleClick = () => {
        if (isHistory) {
            return
        }

        setSelectedDate(datetime)
        setModal(registrationsCount > 0 ? 'registrations' : 'signup')
    }

    return (
        <td className={classes} onClick={handleClick}>
            {registrationsCount > 0 && (
                <Registration name={registrant} count={registrationsCount} />
            )}
        </td>
    )
}

const Registration: React.FC<{ name: string; count: number }> = ({ name, count }) => (
    <div className="week-cell-registration">
        <div className="week-cell-registration-name">{name}</div>
        {count > 1 && <div className="week-cell-registration-count">en nog {count - 1}</div>}
    </div>
)

export default Hour
