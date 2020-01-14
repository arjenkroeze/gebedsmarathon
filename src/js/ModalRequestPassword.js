import React, { useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { useAuth } from './utilities/hooks'

const ModalSignUp = ({ isOpen, toggleModal }) => {
    // Authentication
    const auth = useAuth()

    // State
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [requested, setRequested] = useState(false)

    // Reference
    const emailInput = useRef(null)

    // Reset state on opening/closing the modal
    useEffect(() => {
        setEmail('')
        setError('')
        setRequested(false)
    }, [isOpen])

    // Handle email changes
    const handleChange = ({ target: { value } }) => {
        setEmail(value)
        setError('')
    }

    // Handle form submit
    const handleSubmit = async event => {
        event.preventDefault()

        if (email === '' || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            setError('ERROR_INVALID_EMAIL')
            emailInput.current.focus()
            return
        }

        setLoading(true)

        try {
            await auth.sendPasswordResetEmail(email)

            setRequested(true)
        } catch ({ code }) {
            if (code === 'auth/user-not-found') {
                setError('ERROR_UNKNOWN_USER')
            }
        }

        setLoading(false)
    }

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} centered={true}>
            <div className="modal-header">
                <h3>Wachtwoord vergeten?</h3>
            </div>
            {requested ? (
                <ModalBody>
                    <p className="text-center">
                        Er is een nieuw wachtwoord verstuurd naar je e-mail.
                    </p>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="button" onClick={toggleModal}>
                            Sluiten
                        </button>
                    </div>
                </ModalBody>
            ) : (
                <ModalBody>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">E-mailadres</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="input"
                                value={email}
                                onChange={handleChange}
                                ref={emailInput}
                                required={true}
                            />
                            {error === 'ERROR_INVALID_EMAIL' && (
                                <p className="form-group-help text-danger">
                                    Vul een geldig e-mailadres in.
                                </p>
                            )}
                            {error === 'ERROR_UNKNOWN_USER' && (
                                <p className="form-group-help text-danger">
                                    Er is geen gebruiker met dit e-mailadres.
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
                                Wachtwoord opvragen{' '}
                                {isLoading && (
                                    <span className="spinner-border spinner-border-sm"></span>
                                )}
                            </button>
                        </div>
                    </form>
                </ModalBody>
            )}
        </Modal>
    )
}

export default ModalSignUp
