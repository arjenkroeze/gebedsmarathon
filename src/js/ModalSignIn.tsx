import React, { useContext, useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { ModalProps } from '../types'
import AppContext from './context/AppContext'
import { useAuth } from './utilities/hooks'

const ModalSignUp: React.FC<ModalProps> = ({ isOpen, toggleModal }) => {
    // Authentication
    const auth = useAuth()

    // State
    const [values, setValues] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(false)

    // Context
    const { setModal } = useContext(AppContext)

    // Reference
    const emailInput = useRef<HTMLInputElement>(null)
    const passwordInput = useRef<HTMLInputElement>(null)

    // Reset state on opening/closing the modal
    useEffect(() => {
        setValues({ email: '', password: '' })
        setError('')

        if (isOpen) {
            setTimeout(() => {
                if (emailInput.current) {
                    emailInput.current.focus()
                }
            }, 25)
        }
    }, [isOpen])

    // Handle email changes
    const handleChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
        setError('')
        setValues(values => ({ ...values, [name]: value }))
    }

    // Handle form submit
    const handleSubmit = async (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent> & React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (values.email === '' || !/^[^@]+@[^@]+\.[^@]+$/.test(values.email)) {
            setError('ERROR_INVALID_EMAIL')

            if (emailInput.current) {
                emailInput.current.focus()
            }

            return
        }

        if (values.password === '') {
            setError('ERROR_INVALID_PASSWORD')

            if (passwordInput.current) {
                passwordInput.current.focus()
            }

            return
        }

        setLoading(true)

        try {
            await auth.signin(values.email, values.password)

            toggleModal()
        } catch ({ code }) {
            if (code === 'auth/user-not-found') {
                setError('ERROR_INVALID_EMAIL')
            }

            if (code === 'auth/wrong-password') {
                setError('ERROR_INVALID_PASSWORD')
            }
        }

        setLoading(false)
    }

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} centered={true}>
            <div className="modal-header">
                <h3>Inloggen</h3>
            </div>
            <ModalBody>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">E-mailadres</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="input"
                            value={values.email}
                            onChange={handleChange}
                            ref={emailInput}
                            required={true}
                        />
                        {error === 'ERROR_INVALID_EMAIL' && (
                            <p className="form-group-help text-danger">
                                Vul een geldig e-mailadres in.
                            </p>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">
                            Wachtwoord
                            <button
                                type="button"
                                className="button button-small button-link button-primary"
                                onClick={() => setModal('request-password')}
                                tabIndex={-1}
                            >
                                Wachtwoord vergeten?
                            </button>
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="input"
                            value={values.password}
                            onChange={handleChange}
                            ref={passwordInput}
                            required={true}
                        />
                        {error === 'ERROR_INVALID_PASSWORD' && (
                            <p className="form-group-help text-danger">
                                Het wachtwoord klopt niet.
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
                            Inloggen{' '}
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
