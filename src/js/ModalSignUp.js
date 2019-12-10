import React, { useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { database } from './utilities/firebase'

const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
}

const ModalSignUp = ({ isOpen, toggleModal, selectedDate }) => {
    const [values, setValues] = useState(initialValues)
    const nameInput = useRef(null)

    const handleChange = event => {
        setValues({ ...values, [event.target.name]: [event.target.value] })
    }

    const handleSubmit = async event => {
        event.preventDefault()

        if (values.firstName === '' || values.lastName === '' || values.email === '') {
            return
        }

        const registrationsRef = database.collection('registrations')

        await registrationsRef.add({
            date: selectedDate,
            name: `${values.firstName} ${values.lastName}`,
            email: values.email,
        })

        toggleModal()
    }

    // EFfect to reset the values to the initial values
    useEffect(() => {
        setValues(initialValues)
    }, [isOpen])

    // Effect to focus on the right input when mounting
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                nameInput.current.focus()
            }, 25)
        }
    }, [isOpen])

    const formattedDate = new Intl.DateTimeFormat('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(selectedDate)
    const selectedHour = selectedDate.getHours()
    const formattedDateTime = `${formattedDate} van ${selectedHour}.00 tot ${selectedHour +
        1}.00 uur`

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} fade={false}>
            <ModalBody>
                <p>
                    Vul je naam en e-mailadres in. Je naam wordt gebruikt, zodat het zichtbaar is
                    wie zich heeft ingeschreven. Je e-mailadres wordt enkel gebruikt om je
                    inschrijving eventueel weer te kunnen annuleren.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="date">Datum en Tijd</label>
                        <input type="text" readOnly={true} value={formattedDateTime} />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="firstName">Voornaam</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={values.firstName}
                                onChange={handleChange}
                                ref={nameInput}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Achternaam</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={values.lastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">E-mailadres</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                        />
                        <p className="form-group-help">
                            Onthoud je e-mailadres. Deze heb je nodig om inschrijvingen te kunnen
                            annuleren.
                        </p>
                    </div>
                    <div className="d-flex justify-content-between">
                        <button type="button" className="button" onClick={toggleModal}>
                            Annuleren
                        </button>
                        <button type="submit" className="button button-primary">
                            Inschrijven
                        </button>
                    </div>
                </form>
            </ModalBody>
        </Modal>
    )
}

export default ModalSignUp
