import React, { useContext, useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { ModalProps, Registration } from '../types'
import AppContext from './context/AppContext'
import { useAuth } from './utilities/hooks'

const ModalRegistrations: React.FC<ModalProps> = ({ isOpen, toggleModal }) => {
    // Context
    const { registrations, selectedDate, setModal } = useContext(AppContext)

    // State
    const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])

    // Effect to filter registrations on the selected date
    useEffect(() => {
        const filteredRegistrations = registrations.filter(registration => {
            const registrationDate = new Date(registration.date.seconds * 1000)
            return registrationDate.getTime() === selectedDate.getTime()
        })

        setFilteredRegistrations(filteredRegistrations)
    }, [selectedDate, registrations])

    // Format the date, e.g. 'zondag 1 maart'
    const formattedDate = new Intl.DateTimeFormat('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(selectedDate)

    // Get the hour of the selected date
    const selectedHour = selectedDate.getHours()

    // Create a list of registrations
    const listRegistrations = filteredRegistrations.map((registration, index) => (
        <RegistrationListItem {...registration} key={index} />
    ))

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} centered={true}>
            <div className="modal-header">
                <h3>{formattedDate}</h3>
                <h4>{`${selectedHour}.00 - ${selectedHour + 1}.00 uur`}</h4>
            </div>
            <ModalBody>
                <div className="form-group">
                    {listRegistrations.length > 0 ? (
                        <ul className="list list-users">{listRegistrations}</ul>
                    ) : (
                        <p className="text-muted">Nog geen inschrijvingen.</p>
                    )}
                </div>
                <div className="text-center">
                    <button
                        className="button button-primary button-link button-small"
                        onClick={() => setModal('signup')}
                    >
                        Schrijf je in voor dit uur
                    </button>
                </div>
            </ModalBody>
        </Modal>
    )
}

const RegistrationListItem: React.FC<Registration> = ({ id, name, uid }) => {
    // Authentication
    const auth = useAuth()

    // Context
    const { setModal, setSelectedRegistrationId } = useContext(AppContext)

    const handleDelete = () => {
        setSelectedRegistrationId(id)
        setModal('delete')
    }

    return (
        <li className="list-item">
            <div className="list-item-name">{name}</div>
            {auth && auth.user.uid === uid && (
                <button className="list-item-action" onClick={handleDelete} tabIndex={-1}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path
                            fill="currentColor"
                            d="M28.2 24L47.1 5.1c1.2-1.2 1.2-3.1 0-4.2 -1.2-1.2-3.1-1.2-4.2 0L24 19.7 5.1 0.9c-1.2-1.2-3.1-1.2-4.2 0 -1.2 1.2-1.2 3.1 0 4.2l18.9 18.9L0.9 42.9c-1.2 1.2-1.2 3.1 0 4.2C1.5 47.7 2.2 48 3 48s1.5-0.3 2.1-0.9l18.9-18.9L42.9 47.1c0.6 0.6 1.4 0.9 2.1 0.9s1.5-0.3 2.1-0.9c1.2-1.2 1.2-3.1 0-4.2L28.2 24z"
                        />
                    </svg>
                </button>
            )}
        </li>
    )
}

export default ModalRegistrations
