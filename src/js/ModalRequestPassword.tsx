import React, { useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { ModalProps } from '../types'
import { useAuth } from './utilities/hooks'

const ModalSignUp: React.FC<ModalProps> = ({ isOpen, toggleModal }) => {
    // Authentication
    const auth = useAuth()

    // State
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [requested, setRequested] = useState(false)

    // Reference
    const emailInput = useRef<HTMLInputElement>(null)

    // Reset state on opening/closing the modal
    useEffect(() => {
        setEmail('')
        setError('')
        setRequested(false)
    }, [isOpen])

    // Handle email changes
    const handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(value)
        setError('')
    }

    // Handle form submit
    const handleSubmit = async (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent> & React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (email === '' || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            setError('ERROR_INVALID_EMAIL')

            if (emailInput.current) {
                emailInput.current.focus()
            }

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
                        Er is een mail verstuurd met instructies om je wachtwoord te resetten.
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
