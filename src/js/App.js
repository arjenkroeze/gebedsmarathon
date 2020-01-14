import React, { useEffect, useState } from 'react'
import AppContext from './context/AppContext'
import Header from './Header'
import Location from './Location'
import ModalDelete from './ModalDelete'
import ModalRegistrations from './ModalRegistrations'
import ModalRequestPassword from './ModalRequestPassword'
import ModalSignIn from './ModalSignIn'
import ModalSignUp from './ModalSignUp'
import QuickSignUp from './QuickSignUp'
import Stats from './Stats'
import { database } from './utilities/firebase'
import Week from './Week'

function App() {
    // 1 march 2020, 11:00
    const startDate = new Date(2020, 2, 1, 11)

    // 22 march 2020, 10:00
    const endDate = new Date(2020, 2, 22, 10)

    // State
    const [registrations, setRegistrations] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedRegistrationId, setSelectedRegistrationId] = useState(null)
    const [modal, setModal] = useState(null)

    // EFfect to fetch all registrations from the database
    useEffect(() => {
        const fetchData = async () => {
            // Listen to the snapshot from the Firestore
            database
                .collection('registrations')
                .orderBy('created', 'asc')
                .onSnapshot(async querySnapshot => {
                    const results = []
                    for (const document of querySnapshot.docs) {
                        const registration = document.data()
                        registration.id = document.id

                        results.push(registration)

                        // Convert the timestamp to a Date-object
                        const date = new Date(registration.date.seconds * 1000)

                        // Send a reminder if the registration is 24 hours upfront
                        if (date.getTime() - Date.now() < 86400000 && registration.needsReminder) {
                            await sendReminder(registration)
                        }
                    }
                    setRegistrations(results)
                })
        }

        fetchData()
    }, [])

    const toggleModal = () => setModal(null)

    // Work with full weeks, so start the week always on a monday.
    // Create a new date so this can be changed to the monday before the startDate.
    const startDateCopy = new Date(startDate)
    const startDateCopyDay = startDateCopy.getDay()
    const startDay = 0 // 1 is monday

    // Calculate the difference between the startDate's day and the monday before this date.
    // Then change the startDate to that day.
    if (startDateCopyDay !== startDay) {
        startDateCopy.setDate(startDateCopy.getDate() - startDateCopyDay)
    }

    // Create a new date so this can be changed to the sunday after the endDate.
    const endDateCopy = new Date(endDate)
    const endDateCopyDay = endDateCopy.getDay()
    const endDay = 6 // 6 is saturday

    // Calculate the difference between the endDate's day and the sunday after this date.
    // Then change the endDate to that sunday.
    if (endDateCopyDay !== endDay) {
        const offset = [6, 5, 4, 3, 2, 1, 0]
        endDateCopy.setDate(endDateCopy.getDate() + offset[endDateCopyDay])
    }

    // Calculate the difference in days between the startDate and endDate
    const numberOfDays = Math.ceil(
        (endDateCopy.getTime() - startDateCopy.getTime()) / 1000 / 60 / 60 / 24
    )

    // Set an array to store the weeks
    const weeks = []

    // For every day, do the following...
    for (let i = 0; i < numberOfDays; i++) {
        // Create a week for every 7 days
        if (i % 7 === 0) {
            // Create the start date of the week which is the startDate plus the difference in days
            const weekStartDate = new Date(startDateCopy)
            weekStartDate.setDate(weekStartDate.getDate() + i)

            // Create the end date of the week, which is the start date + 6 days
            const weekEndDate = new Date(weekStartDate)
            weekEndDate.setDate(weekEndDate.getDate() + 6)

            weeks.push(<Week key={i} startDate={weekStartDate} endDate={weekEndDate} />)
        }
    }

    // Send a reminder
    async function sendReminder(registration) {
        const registrationDate = new Date(registration.date.seconds * 1000)

        await database.collection('mail').add({
            from: 'Gebedsmarathon <noreply@gebedsmarathon.nl>',
            to: [registration.email],
            message: {
                subject: 'Een herinnering voor morgen',
                text: `Beste ${
                    registration.name
                },\r\nDit is een geautomatiseerd bericht ter herinnering dat je morgen om <strong>${registrationDate.getHours()}.00 uur</strong> staat ingeschreven voor de gebedsmarathon.\r\nWees gezegend!`,
                html: `Beste ${
                    registration.name
                },<br /><br />Dit is een geautomatiseerd bericht ter herinnering dat je morgen om <strong>${registrationDate.getHours()}.00 uur</strong> staat ingeschreven voor de gebedsmarathon.<br /><br />Wees gezegend!`,
            },
        })

        // Very important to update the reminderSent flag
        await database
            .collection('registrations')
            .doc(registration.id)
            .update({ reminderSent: true })
    }

    return (
        <AppContext.Provider
            value={{
                startDate,
                endDate,
                registrations,
                setModal,
                selectedDate,
                setSelectedDate,
                selectedRegistrationId,
                setSelectedRegistrationId,
            }}
        >
            <Header />
            <Stats />
            <QuickSignUp />
            {weeks}
            <Location />
            <ModalSignIn isOpen={modal === 'signin'} toggleModal={toggleModal} />
            <ModalRequestPassword isOpen={modal === 'request-password'} toggleModal={toggleModal} />
            <ModalSignUp isOpen={modal === 'signup'} toggleModal={toggleModal} />
            <ModalRegistrations isOpen={modal === 'registrations'} toggleModal={toggleModal} />
            <ModalDelete isOpen={modal === 'delete'} toggleModal={toggleModal} />
        </AppContext.Provider>
    )
}

export default App
