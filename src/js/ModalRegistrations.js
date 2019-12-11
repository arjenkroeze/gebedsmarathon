import React, { useContext } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import AppContext from './context/AppContext'

const ModalRegistrations = ({ isOpen, toggleModal }) => {
    const { registrations, selectedDate, setModal } = useContext(AppContext)

    const dateFormat = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }
    const formattedDate = new Intl.DateTimeFormat('nl-NL', dateFormat).format(selectedDate)
    const selectedHour = selectedDate.getHours()
    const formattedDateTime = `${formattedDate} van ${selectedHour}.00 tot ${selectedHour +
        1}.00 uur`

    const listRegistrations = registrations
        .filter(
            registration =>
                new Date(registration.date.seconds * 1000).getTime() === selectedDate.getTime()
        )
        .map((registration, index) => (
            <li key={index} className="list-item">
                <div className="list-item-user">
                    <span className="list-item-name">{registration.name}</span>
                    {registration.comment && (
                        <span className="list-item-comment">{registration.comment}</span>
                    )}
                </div>
            </li>
        ))

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} fade={false} centered={true}>
            <ModalBody>
                <div className="form-group">
                    <label htmlFor="date">Datum en Tijd</label>
                    <input
                        type="text"
                        className="input"
                        readOnly={true}
                        value={formattedDateTime}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="date">Inschrijvingen</label>
                    <ul className="list list-users">{listRegistrations}</ul>
                </div>
                <div className="text-center">
                    <button
                        className="button button-primary button-link button-small"
                        onClick={() => setModal('signup')}
                    >
                        Schrijf je ook in voor dit uur
                    </button>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default ModalRegistrations
