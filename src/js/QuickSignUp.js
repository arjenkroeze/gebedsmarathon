import React, { useContext, useEffect, useState } from 'react'
import AppContext from './context/AppContext'
import { database } from './utilities/firebase'

const initialValues = {
    selectedDate: '',
    selectedHour: '0',
    firstName: '',
    lastName: '',
    email: '',
}

const QuickSignUp = () => {
    // Context
    const { startDate, endDate } = useContext(AppContext)

    // State
    const [referralDate, setReferralDate] = useState(new Date())
    const [dateOptions, setDateOptions] = useState([])
    const [hourOptions, setHourOptions] = useState([])
    const [values, setValues] = useState(initialValues)
    const [success, setSuccess] = useState(false)

    // Make sure no registrations are made in history, so replace the startDate with a new Date
    useEffect(() => {
        setReferralDate(startDate.getTime() > Date.now() ? startDate : new Date())
    }, [startDate])

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

        // When all dates are set, update the state
        setDateOptions(dates)
    }, [referralDate, endDate])

    // Set the initial date value
    useEffect(() => {
        setValues(values => ({
            ...values,
            selectedDate: dateOptions.length ? dateOptions[0].date : '',
        }))
    }, [dateOptions])

    // Set the hours options
    useEffect(() => {
        const dayDate = values.selectedDate ? new Date(Number(values.selectedDate)) : null

        if (!dayDate) {
            return
        }

        const hours = []

        for (let i = 0; i < 24; i++) {
            const hourDate = new Date(dayDate.setHours(i))

            if (hourDate.getTime() >= referralDate.getTime()) {
                hours.push({ label: `${i}.00 - ${i + 1}.00 uur`, hour: `${i}` })
            }
        }

        if (!hours.length) {
            return
        }

        setHourOptions(hours)
        setValues(values => ({ ...values, selectedHour: hours[0].hour }))
    }, [values.selectedDate, referralDate])

    function handleChange({ target: { name, value } }) {
        setValues(values => ({ ...values, [name]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()

        let valid = Object.values(values).some(value => value !== '')

        if (!/^[^@]+@[^@]+\.[^@]+$/.test(values.email)) {
            valid = false
        }

        if (!valid) {
            return
        }

        const registrationDate = new Date(Number(values.selectedDate))
        registrationDate.setHours(values.selectedHour)
        registrationDate.setMinutes(0)
        registrationDate.setSeconds(0)

        // Collection reference
        await database.collection('registrations').add({
            created: Date.now(),
            date: registrationDate,
            name: `${values.firstName} ${values.lastName}`,
            email: values.email,
        })

        setSuccess(true)

        setValues(initialValues)
    }

    if (success) {
        return (
            <div className="quick-signup quick-signup-success">
                <h3>Gelukt!</h3>
                <p>
                    Bedankt voor je inschrijving. Gebruik de knop hieronder als je je voor nog een
                    uur wilt inschrijven.
                </p>
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
            />

            <p className="form-group-help">
                Je e-mailadres wordt gebruikt om inschrijvingen te kunnen annuleren.
            </p>
            <button className="button button-primary" onClick={handleSubmit}>
                Inschrijven
            </button>
        </div>
    )
}

export default QuickSignUp
