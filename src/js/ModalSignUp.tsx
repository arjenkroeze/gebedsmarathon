import React, { useContext, useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { ModalProps } from '../types'
import AppContext from './context/AppContext'
import { database } from './utilities/firebase'

const ModalSignUp: React.FC<ModalProps> = ({ isOpen, toggleModal }) => {
    // Context
    const { selectedDate, setModal } = useContext(AppContext)

    // State
    const [names, setNames] = useState<Array<{ [key: string]: any }>>([
        { id: 0, firstName: '', lastName: '' },
    ])
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Reference
    const nameInput = useRef<HTMLInputElement>(null)
    const emailInput = useRef<HTMLInputElement>(null)

    // EFfect to reset the values to the initial values
    useEffect(() => {
        setNames([{ id: 0, firstName: '', lastName: '' }])
        setEmail('')
        setError('')

        if (isOpen) {
            // Reset the flag
            setSuccess(false)

            // Focus on the input with a short delay to spare the animation
            setTimeout(() => {
                if (nameInput.current) {
                    nameInput.current.focus()
                }
            }, 25)
        }
    }, [isOpen])

    // Handle name changes
    const handleNameChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
        // Get the ID
        const id = Number(target.id.split('-').pop())

        // Update the names
        const updatedNames = names.map(name => {
            if (name.id === id) {
                name[target.name] = target.value
            }

            return name
        })

        setNames(updatedNames)
    }

    // Handle email changes
    const handleEmailChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(value)
    }

    // Handle form submit
    const handleSubmit = async (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent> & React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        // Validate names
        for (const { firstName, lastName } of names) {
            if (firstName === '' || lastName === '') {
                setError('ERROR_INVALID_NAME')

                if (nameInput.current) {
                    nameInput.current.focus()
                }

                return
            }
        }

        // Validate the email
        if (email === '' || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            setError('ERROR_INVALID_EMAIL')

            if (emailInput.current) {
                emailInput.current.focus()
            }

            return
        }

        // All set, let's set a flag for loading
        setLoading(true)

        // Collection reference
        const registrationsRef = database.collection('registrations')

        // Prepare the Firestore batch
        const batch = database.batch()

        // Add registrations to the batch
        names.forEach((name, index) => {
            const within24Hours = selectedDate.getTime() - Date.now() < 86400000

            batch.set(registrationsRef.doc(), {
                created: new Date(Date.now() + index),
                date: selectedDate,
                name: `${name.firstName} ${name.lastName}`,
                email,
                needsReminder: !index && !within24Hours,
            })
        })

        // Commit the batch
        await batch.commit()

        setSuccess(true)

        setLoading(false)
    }

    // Add a name
    const addName = () => {
        setNames(names => [...names, { id: names.length, firstName: '', lastName: '' }])
    }

    // Remove a name
    const removeName = (id: string) => {
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

    if (success || isLoading) {
        return (
            <Modal isOpen={isOpen} toggle={toggleModal} centered={true}>
                <ModalBody>
                    <p className="text-center mb-0">
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            'Succesvol ingeschreven!'
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
            </Modal>
        )
    }

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} centered={true}>
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
                            <div className="form-grid" key={index}>
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
                                        readOnly={isLoading}
                                    />
                                    {error === 'ERROR_INVALID_NAME' && (
                                        <p className="form-group-help text-danger">
                                            Vul een voor- en achternaam in.
                                        </p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor={lastNameId}>
                                        Achternaam *
                                        {name.id !== 0 && (
                                            <button
                                                type="button"
                                                className="button button-small button-link button-danger"
                                                onClick={() => removeName(name.id)}
                                                tabIndex={-1}
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
                                        readOnly={isLoading}
                                    />
                                </div>
                            </div>
                        )
                    })}
                    {names.length < 5 && (
                        <button
                            type="button"
                            className="button button-primary button-link button-small button-add"
                            onClick={!isLoading ? addName : undefined}
                            tabIndex={-1}
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
                            ref={emailInput}
                            required={true}
                            readOnly={isLoading}
                        />
                        {error === 'ERROR_INVALID_EMAIL' && (
                            <p className="form-group-help text-danger">
                                Vul een geldig e-mailadres in.
                            </p>
                        )}

                        {error === 'EMAIL_IN_USE' && (
                            <p className="form-group-help text-danger">
                                Dit e-mailadres is al in gebruik. Wil je{' '}
                                <button tabIndex={-1} onClick={() => setModal('signin')}>
                                    inloggen
                                </button>
                                ?
                            </p>
                        )}
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
                            Inschrijven{' '}
                            {isLoading && (
                                <span className="spinner-border spinner-border-sm"></span>
                            )}
                        </button>
                    </div>
                </form>
            </ModalBody>
        </Modal>
    )
}

export default ModalSignUp
