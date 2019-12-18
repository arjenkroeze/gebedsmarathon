import React, { useContext, useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import AppContext from './context/AppContext'
import { database } from './utilities/firebase'

const ModalSignUp = ({ isOpen, toggleModal }) => {
    // Context
    const { selectedDate } = useContext(AppContext)

    // State
    const [names, setNames] = useState([{ id: 0, firstName: '', lastName: '' }])
    const [email, setEmail] = useState('')
    const [signed, setSigned] = useState(false)

    // Reference
    const nameInput = useRef(null)

    // EFfect to reset the values to the initial values
    useEffect(() => {
        setNames([{ id: 0, firstName: '', lastName: '' }])
        setEmail('')

        if (isOpen) {
            // Reset the flag
            setSigned(false)

            // Focus on the input with a short delay to spare the animation
            setTimeout(() => {
                nameInput.current.focus()
            }, 25)
        }
    }, [isOpen])

    // Handle name changes
    const handleNameChange = event => {
        // Get the ID
        const id = Number(event.target.id.split('-').pop())

        // Update the names
        const updatedNames = names.map(name => {
            if (name.id === id) {
                name[event.target.name] = event.target.value
            }

            return name
        })

        setNames(updatedNames)
    }

    // Handle email changes
    const handleEmailChange = event => {
        setEmail(event.target.value)
    }

    // Handle form submit
    const handleSubmit = async event => {
        event.preventDefault()

        // Validate!
        let valid = true

        names.forEach(({ firstName, lastName }) => {
            if (firstName === '' || lastName === '') {
                valid = false
            }
        })

        if (email === '' || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            valid = false
        }

        if (!valid) {
            return
        }

        // Collection reference
        const registrationsRef = database.collection('registrations')

        // Prepare the Firestore batch
        const batch = database.batch()

        // Add overviews to the batch
        names.forEach(name => {
            batch.set(registrationsRef.doc(), {
                created: Date.now(),
                date: selectedDate,
                name: `${name.firstName} ${name.lastName}`,
                email,
            })
        })

        // Commit the batch
        await batch.commit()

        // Flag signed
        setSigned(true)
    }

    // Add a name
    const addName = () => {
        setNames(names => [...names, { id: names.length, firstName: '', lastName: '' }])
    }

    const removeName = id => {
        const newNames = names.filter(name => name.id !== id)
        setNames(newNames)
    }

    // Format the date, e.g. 'zondag 1 maart'
    const formattedDate = new Intl.DateTimeFormat('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(selectedDate)

    // Get the hour of the selected date
    const selectedHour = selectedDate.getHours()

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} centered={true}>
            {signed ? (
                <ModalBody>
                    <p>Succesvol ingeschreven! Dit venster kan worden gesloten.</p>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="button" onClick={toggleModal}>
                            Sluiten
                        </button>
                    </div>
                </ModalBody>
            ) : (
                <>
                    <div className="modal-header">
                        <h3>{formattedDate}</h3>
                        <h4>{`${selectedHour}.00 - ${selectedHour + 1}.00 uur`}</h4>
                    </div>
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            {names.map((name, index) => {
                                const firstNameId = `firstName-${name.id}`
                                const lastNameId = `lastName-${name.id}`

                                return (
                                    <div key={index} className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor={firstNameId}>Voornaam *</label>
                                            <input
                                                type="text"
                                                id={firstNameId}
                                                name="firstName"
                                                className="input"
                                                value={name.firstName}
                                                onChange={handleNameChange}
                                                ref={name.id === 0 ? nameInput : null}
                                                required={true}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor={lastNameId}>
                                                Achternaam *
                                                {name.id !== 0 && (
                                                    <button
                                                        type="button"
                                                        className="button button-small button-link button-danger"
                                                        onClick={() => removeName(name.id)}
                                                    >
                                                        Verwijderen
                                                    </button>
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                id={lastNameId}
                                                name="lastName"
                                                className="input"
                                                value={name.lastName}
                                                onChange={handleNameChange}
                                                required={true}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                            {names.length < 5 && (
                                <button
                                    type="button"
                                    className="button button-primary button-link button-small button-add"
                                    onClick={addName}
                                >
                                    Ik neem nog iemand mee
                                </button>
                            )}
                            <div className="form-group">
                                <label htmlFor="email">E-mailadres *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="input"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required={true}
                                />
                                <p className="form-group-help">
                                    Je e-mailadres wordt gebruikt om inschrijvingen te kunnen
                                    annuleren.
                                </p>
                            </div>
                            <div className="d-flex justify-content-between">
                                <button type="button" className="button" onClick={toggleModal}>
                                    Annuleren
                                </button>
                                <button
                                    type="submit"
                                    className="button button-primary"
                                    onClick={handleSubmit}
                                >
                                    Inschrijven
                                </button>
                            </div>
                        </form>
                    </ModalBody>
                </>
            )}
        </Modal>
    )
}

export default ModalSignUp
