import React, { useContext, useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import AppContext from './context/AppContext'
import { database } from './utilities/firebase'

const ModalDelete = ({ isOpen, toggleModal }) => {
    // Context
    const { selectedDate, selectedRegistrationId } = useContext(AppContext)

    // State
    const [deleted, setDeleted] = useState(false)

    // EFfect to reset the values to the initial values
    useEffect(() => {
        if (isOpen) {
            // Reset the flag
            setDeleted(false)
        }
    }, [isOpen])

    // Handle form submit
    const handleSubmit = async event => {
        event.preventDefault()

        // Database reference
        const registrationsRef = database.collection('registrations')

        // Remove
        await registrationsRef.doc(selectedRegistrationId).delete()

        // Flag deleted
        setDeleted(true)
    }

    // Format the date, e.g. 'zondag 1 maart'
    const formattedDate = new Intl.DateTimeFormat('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(selectedDate)

    // Get the hour of the selected date
    const selectedHour = selectedDate.getHours()

    if (!selectedRegistrationId) {
        return null
    }

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} centered={true}>
            {deleted ? (
                <ModalBody>
                    <p className="text-center mb-0">Succesvol verwijderd!</p>
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
                        <p className="text-center">
                            Weet je zeker dat je deze inschrijving wilt verwijderen?
                        </p>
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
                    </ModalBody>
                </>
            )}
        </Modal>
    )
}

export default ModalDelete
