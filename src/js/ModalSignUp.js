import React, { useContext, useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import AppContext from './context/AppContext'
import { database } from './utilities/firebase'

const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
}

const ModalSignUp = ({ isOpen, toggleModal }) => {
    const [values, setValues] = useState(initialValues)
    const { selectedDate } = useContext(AppContext)
    const nameInput = useRef(null)

    const handleChange = event => {
        setValues({
            ...values,
            [event.target.name]: event.target.value,
        })
    }

    const handleSubmit = async event => {
        event.preventDefault()

        if (values.firstName === '' || values.lastName === '' || values.email === '') {
            return
        }

        const registrationsRef = database.collection('registrations')

        await registrationsRef.add({
            created: Date.now(),
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
        <Modal isOpen={isOpen} toggle={toggleModal} fade={false} centered={true}>
            <ModalBody>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="date">Datum en Tijd</label>
                        <input
                            type="text"
                            className="input"
                            readOnly={true}
                            value={formattedDateTime}
                        />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="firstName">Voornaam *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                className="input"
                                value={values.firstName}
                                onChange={handleChange}
                                ref={nameInput}
                                required={true}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Achternaam *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                className="input"
                                value={values.lastName}
                                onChange={handleChange}
                                required={true}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">E-mailadres *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="input"
                            value={values.email}
                            onChange={handleChange}
                            required={true}
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
