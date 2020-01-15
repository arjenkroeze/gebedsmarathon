import React, { useContext, useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { ModalProps } from '../types'
import AppContext from './context/AppContext'
import { database } from './utilities/firebase'

const ModalDelete: React.FC<ModalProps> = ({ isOpen, toggleModal }) => {
    // Context
    const { selectedDate, selectedRegistration } = useContext(AppContext)

    // State
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [deleted, setDeleted] = useState(false)
    const [isLoading, setLoading] = useState(false)

    // Reference
    const emailInput = useRef<HTMLInputElement>(null)

    // EFfect to reset the values to the initial values
    useEffect(() => {
        setEmail('')

        if (isOpen) {
            // Reset the flag
            setDeleted(false)

            // Focus on the input with a short delay to spare the animation
            setTimeout(() => {
                if (emailInput.current) {
                    emailInput.current.focus()
                }
            }, 25)
        }
    }, [isOpen])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError('')
        setEmail(event.target.value)
    }

    // Handle form submit
    const handleSubmit = async (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent> & React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (email === '' || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            setError('Voer een geldig e-mailadres in')
            return
        }

        if (!selectedRegistration) {
            setError('Geen inschrijving geselecteerd.')
            return
        }

        if (email !== selectedRegistration.email) {
            setError('E-mailadres komt niet overeen.')

            if (emailInput.current) {
                emailInput.current.focus()
            }

            return
        }

        setLoading(true)

        // Database reference
        const registrationsRef = database.collection('registrations')

        // Remove
        await registrationsRef.doc(selectedRegistration.id).delete()

        // Flag deleted
        setDeleted(true)
        setLoading(false)
    }

    // Format the date, e.g. 'zondag 1 maart'
    const formattedDate = new Intl.DateTimeFormat('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(selectedDate)

    // Get the hour of the selected date
    const selectedHour = selectedDate.getHours()

    if (!selectedRegistration) {
        return null
    }

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} centered={true}>
            {deleted ? (
                <ModalBody>
                    <p className="text-center mb-0">
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            'Inschrijving verwijderd!'
                        )}
                    </p>
                    <p className="text-center mb-0">
                        <button
                            type="button"
                            className="button button-link button-primary pb-0"
                            onClick={toggleModal}
                        >
                            Sluiten
                        </button>
                    </p>
                </ModalBody>
            ) : (
                <>
                    <div className="modal-header">
                        <h3>{formattedDate}</h3>
                        <h4>{`${selectedHour}.00 - ${selectedHour + 1}.00 uur`}</h4>
                    </div>
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Naam</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="input"
                                    value={selectedRegistration.name}
                                    readOnly={true}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">E-mailadres *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="input"
                                    value={email}
                                    onChange={handleChange}
                                    required={true}
                                    ref={emailInput}
                                />
                                {error && <p className="form-group-help text-danger">{error}</p>}
                            </div>
                            <div className="d-flex justify-content-between">
                                <button type="button" className="button" onClick={toggleModal}>
                                    Annuleren
                                </button>
                                <button
                                    type="submit"
                                    className="button button-danger"
                                    onClick={handleSubmit}
                                >
                                    Verwijderen
                                </button>
                            </div>
                        </form>
                    </ModalBody>
                </>
            )}
        </Modal>
    )
}

export default ModalDelete
