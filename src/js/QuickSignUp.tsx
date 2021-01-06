import React, { useContext, useEffect, useState } from 'react'
import { DateOption, HourOption } from '../types'
import AppContext from './context/AppContext'
import { database } from './utilities/firebase'

const initialValues: { [key: string]: any } = {
    selectedDate: '',
    selectedHour: '0',
    firstName: '',
    lastName: '',
    email: '',
}

const QuickSignUp = () => {
    // Context
    const { startDate, endDate, setModal } = useContext(AppContext)

    // State
    const [referralDate, setReferralDate] = useState(new Date())
    const [dateOptions, setDateOptions] = useState<DateOption[]>([])
    const [hourOptions, setHourOptions] = useState<HourOption[]>([])
    const [values, setValues] = useState(initialValues)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (success) {
            setTimeout(() => {
                setSuccess(false)
            }, 5000)
        }
    }, [success])

    // Make sure no registrations are made in history, so replace the startDate with a new Date
    useEffect(() => {
        setReferralDate(startDate.getTime() > Date.now() ? startDate : new Date())
    }, [startDate])

    // This effect will populate the options for selecting a day
    useEffect(() => {
        // The temporary array where we will store the dates
        const dates: DateOption[] = []

        // Calculate the number of days we need to render
        const numberOfDays = Math.ceil(
            (endDate.getTime() - referralDate.getTime()) / 1000 / 60 / 60 / 24
        )

        // For every day...
        for (let j = 0; j <= numberOfDays; j++) {
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
        const hours: HourOption[] = []

        // For every hour in a day...
        for (let i = 0; i < 24; i++) {
            // Create a Date-object
            const hourDate = new Date(dayDate.setHours(i))

            // Only add an option if the referralDate has not passed yet
            if (
                hourDate.getTime() >= referralDate.getTime() &&
                hourDate.getTime() <= endDate.getTime()
            ) {
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
    }, [values.selectedDate, referralDate, endDate])

    // Handle input changes
    function handleChange({
        target: { name, value },
    }: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setValues(values => ({ ...values, [name]: value }))
    }

    // Handle form submitting
    async function handleSubmit(
        event: React.MouseEvent<HTMLButtonElement, MouseEvent> & React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        // Destructure to improve readability
        const { firstName, lastName, email, selectedDate, selectedHour } = values

        // Validate names
        if (!Object.values(values).some(value => value !== '')) {
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

        const within24Hours = registrationDate.getTime() - Date.now() < 86400000

        // Add the registration to the database
        await database.collection('registrations').add({
            created: new Date(),
            date: registrationDate,
            name: `${firstName} ${lastName}`,
            email,
            needsReminder: !within24Hours,
        })

        // Flag to show a success message
        setSuccess(true)

        setLoading(false)

        setValues(initialValues)
    }

    if (endDate.getTime() <= Date.now()) {
        return null
    }

    return (
        <form className="quick-signup" onSubmit={handleSubmit}>
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
            <div className="form-grid">
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
            </div>
            <input
                type="email"
                className="input"
                placeholder="E-mailadres"
                name="email"
                value={values.email}
                onChange={handleChange}
            />

            {error === 'EMAIL_IN_USE' && (
                <p className="form-group-help text-danger">
                    Dit e-mailadres is al in gebruik. Wil je{' '}
                    <button onClick={() => setModal('signin')}>inloggen</button>?
                </p>
            )}

            {success ? (
                <button type="button" className="button button-success">
                    Gelukt!
                </button>
            ) : (
                <button className="button button-primary" onClick={handleSubmit}>
                    Inschrijven
                    {isLoading && <span className="spinner-border spinner-border-sm"></span>}
                </button>
            )}
        </form>
    )
}

export default QuickSignUp
