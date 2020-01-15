import React, { useContext, useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { ModalProps } from '../types'
import AppContext from './context/AppContext'
import { database } from './utilities/firebase'
import { randomString } from './utilities/functions'
import { useAuth } from './utilities/hooks'

const ModalSignUp: React.FC<ModalProps> = ({ isOpen, toggleModal }) => {
    // Authentication
    const auth = useAuth()

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
        const defaultNames = [{ id: 0, firstName: '', lastName: '' }]

        if (auth.user) {
            const [firstName, lastName] =
                auth.user && auth.user.displayName ? auth.user.displayName.split('|') : ['', '']
            defaultNames[0].firstName = firstName
            defaultNames[0].lastName = lastName
        }

        setNames(defaultNames)
        setEmail(auth.user ? auth.user.email : '')
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
    }, [isOpen, auth.user])

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
        const mailRef = database.collection('mail')

        // Create a random password
        const password = randomString()

        // Check if a user is logged in
        let user = auth.user ? auth.user : null

        // Create a user if the user is not logged in
        if (!user) {
            try {
                // Create a new account
                user = await auth.signup(email, password)

                // Inform the user by sending the username and password by email
                await mailRef.add({
                    from: 'Gebedsmarathon <noreply@gebedsmarathon.nl>',
                    to: [email],
                    message: {
                        messageId: 'account-creation',
                        subject: 'Account aangemaakt',
                        text: `Er is een account voor je aangemaakt op www.gebedsmarathon.nl:\r\n\r\nGebruikersnaam: ${email}\r\nWachtwoord: ${password}\r\n\r\nMet dit account kun je je inschrijvingen beheren.`,
                        html: `<p>Er is een account voor je aangemaakt op <a href="https://www.gebedsmarathon.nl">www.gebedsmarathon.nl</a>:</p><p>Gebruikersnaam: ${email}<br />Wachtwoord: ${password}</p><p>Met dit account kun je je inschrijvingen beheren.<p>`,
                    },
                })

                // Little cheat to save the first and last name of the user
                await auth.updateProfile(`${names[0].firstName}|${names[0].lastName}`)
            } catch (error) {
                // Catch existing users
                if (error.code === 'auth/email-already-in-use') {
                    setError('EMAIL_IN_USE')
                }

                setLoading(false)

                return
            }
        }

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
                uid: user.uid,
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
                            readOnly={isLoading || auth.user}
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
