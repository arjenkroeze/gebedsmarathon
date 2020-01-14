import React, { useContext, useEffect, useState } from 'react'
import AppContext from './context/AppContext'
import { database } from './utilities/firebase'
import { randomString } from './utilities/functions'
import { useAuth } from './utilities/hooks'

const initialValues = {
    selectedDate: '',
    selectedHour: '0',
    firstName: '',
    lastName: '',
    email: '',
}

const QuickSignUp = () => {
    // Authentication
    const auth = useAuth()

    // Context
    const { startDate, endDate, setModal } = useContext(AppContext)

    // State
    const referralDate = startDate.getTime() > Date.now() ? startDate : new Date()
    const [dateOptions, setDateOptions] = useState([])
    const [hourOptions, setHourOptions] = useState([])
    const [values, setValues] = useState(initialValues)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(false)

    // EFfect to reset the values to the initial values
    useEffect(() => {
        const defaultValues = initialValues

        // Populate values with user data
        if (auth.user) {
            const [firstName, lastName] = auth.user.displayName.split('|')
            defaultValues.firstName = firstName
            defaultValues.lastName = lastName
        }

        setValues(defaultValues)
        setError('')
    }, [auth.user])

    // This effect will populate the options for selecting a day
    useEffect(() => {
        // The temporary array where we will store the dates
        const dates = []

        // Calculate the number of days we need to render
        const numberOfDays = Math.ceil(
            (endDate.getTime() - referralDate.getTime()) / 1000 / 60 / 60 / 24
        )

        // For every day...
        for (let j = 0; j < numberOfDays; j++) {
            // Create a date object...
            const dayDate = new Date(referralDate)
            dayDate.setDate(dayDate.getDate() + j)

            // Reset the hours...
            dayDate.setHours(0)

            // Create a readable date format...
            const dayName = new Intl.DateTimeFormat('nl-NL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }).format(dayDate)

            // ... and add it to the array!
            dates.push({ label: dayName, date: dayDate.getTime() })
        }

        // Bail if no dates are present
        if (!dates.length) {
            return
        }

        // When all dates are set, update the state...
        setDateOptions(dates)

        // ...and set the selectedDate to the first value in the array
        setValues(values => ({
            ...values,
            selectedDate: dates[0].date,
        }))
    }, [referralDate, endDate])

    // Set the hours options
    useEffect(() => {
        // Convert the selectedDate to a Date-object
        const dayDate = values.selectedDate ? new Date(Number(values.selectedDate)) : null

        // Bail if no date is given
        if (!dayDate) {
            return
        }

        // The temporary array where hours are stored
        const hours = []

        // For every hour in a day...
        for (let i = 0; i < 24; i++) {
            // Create a Date-object
            const hourDate = new Date(dayDate.setHours(i))

            // Only add an option if the referralDate has not passed yet
            if (hourDate.getTime() >= referralDate.getTime()) {
                hours.push({ label: `${i}.00 - ${i + 1}.00 uur`, hour: `${i}` })
            }
        }

        // Bail if no hours are present
        if (!hours.length) {
            return
        }

        // Update the state...
        setHourOptions(hours)

        // ...and set the selectedHour to the first item in the array
        setValues(values => ({ ...values, selectedHour: hours[0].hour }))
    }, [values.selectedDate, referralDate])

    // Handle input changes
    function handleChange({ target: { name, value } }) {
        setValues(values => ({ ...values, [name]: value }))
    }

    // Handle form submitting
    async function handleSubmit(event) {
        event.preventDefault()

        // Destructure to improve readability
        const { firstName, lastName, email, selectedDate, selectedHour } = values

        // Validate names
        if (Object.values(values).some(value => value !== '')) {
            setError('ERROR_INVALID_NAME')
            return
        }

        // Validate the email
        if (email === '' || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            setError('ERROR_INVALID_EMAIL')
            return
        }

        // All set, let's set a flag for loading
        setLoading(true)

        // Update the selectedDate and reset the minuts and seconds value
        const registrationDate = new Date(Number(selectedDate))
        registrationDate.setHours(selectedHour)
        registrationDate.setMinutes(0)
        registrationDate.setSeconds(0)

        // References
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
                        subject: 'Account aangemaakt',
                        text: `Er is een account voor je aangemaakt op www.gebedsmarathon.nl:\r\n\r\nGebruikersnaam: ${email}\r\nWachtwoord: ${password}\r\n\r\nMet dit account kun je je inschrijvingen beheren.`,
                        html: `<p>Er is een account voor je aangemaakt op <a href="https://www.gebedsmarathon.nl">www.gebedsmarathon.nl</a>:</p><p>Gebruikersnaam: ${email}<br />Wachtwoord: ${password}</p><p>Met dit account kun je je inschrijvingen beheren.<p>`,
                    },
                })

                // Little cheat to save the first and last name of the user
                await auth.updateProfile(`${firstName},${lastName}`)
            } catch (error) {
                // Catch existing users
                if (error.code === 'auth/email-already-in-use') {
                    setError('EMAIL_IN_USE')
                }

                setLoading(false)

                throw error
            }
        }

        // Add the registration to the database
        await registrationsRef.add({
            created: new Date(),
            date: registrationDate,
            name: `${firstName} ${lastName}`,
            uid: user.uid,
            needsReminder: true,
        })

        // Flag to show a success message
        setSuccess(true)

        setLoading(false)

        setValues(initialValues)
    }

    if (success) {
        return (
            <div className="quick-signup quick-signup-success">
                <h3>Gelukt!</h3>
                <p>Bedankt voor je inschrijving.</p>
                <button className="button" onClick={() => setSuccess(false)}>
                    Inschrijven
                </button>
            </div>
        )
    }

    return (
        <div className="quick-signup">
            <h3>Schrijf je in</h3>
            <p>
                Gebruik onderstaand formulier om je in te schrijven. Nog verder naar beneden staat
                een tabel waar je je inschrijving(en) kunt bekijken.
            </p>
            <select
                className="select"
                name="selectedDate"
                value={values.selectedDate}
                onChange={handleChange}
            >
                {dateOptions.map(({ label, date }) => (
                    <option value={date} key={date}>
                        {label}
                    </option>
                ))}
            </select>
            <select
                className="select"
                name="selectedHour"
                value={values.selectedHour}
                onChange={handleChange}
            >
                {hourOptions.map(({ label, hour }) => (
                    <option value={hour} key={hour}>
                        {label}
                    </option>
                ))}
            </select>
            <input
                type="text"
                className="input"
                placeholder="Voornaam"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
            />
            <input
                type="text"
                className="input"
                placeholder="Achternaam"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
            />
            <input
                type="email"
                className="input"
                placeholder="E-mailadres"
                name="email"
                value={values.email}
                onChange={handleChange}
                readOnly={auth.user}
            />

            {error === 'EMAIL_IN_USE' && (
                <p className="form-group-help text-danger">
                    Dit e-mailadres is al in gebruik. Wil je{' '}
                    <button onClick={() => setModal('signin')}>inloggen</button>?
                </p>
            )}

            <button className="button button-primary" onClick={handleSubmit}>
                Inschrijven
                {isLoading && <span className="spinner-border spinner-border-sm"></span>}
            </button>
        </div>
    )
}

export default QuickSignUp
