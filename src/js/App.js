import React, { useEffect, useState } from 'react'
import AppContext from './context/AppContext'
import ModalSignUp from './ModalSignUp'
import Stats from './Stats'
import { database } from './utilities/firebase'
import Week from './Week'

function App() {
    const startDate = new Date('2020-3-1 11:00')
    const endDate = new Date('2020-3-22 10:00')
    const [registrations, setRegistrations] = useState([])

    // EFfect to fetch all registrations from the database
    useEffect(() => {
        const fetchData = async () => {
            // Get the snapshot from the Firestore
            database.collection('registrations').onSnapshot(querySnapshot => {
                const results = []
                querySnapshot.forEach(doc => {
                    results.push({ id: doc.id, ...doc.data() })
                })
                setRegistrations(results)
            })
        }

        fetchData()
    }, [])

    const [modal, setModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const toggleModal = () => setModal(!modal)

    // Work with full weeks, so start the week always on a monday.
    // Create a new date so this can be changed to the monday before the startDate.
    const startDateCopy = new Date(startDate)
    const startDateCopyDay = startDateCopy.getDay()
    const monday = 1

    // Calculate the difference between the startDate's day and the monday before this date.
    // Then change the startDate to that day.
    if (startDateCopyDay !== monday) {
        const offset = [6, 0, 1, 2, 3, 4, 5]
        startDateCopy.setDate(startDateCopy.getDate() - offset[startDateCopyDay])
    }

    // Create a new date so this can be changed to the sunday after the endDate.
    const endDateCopy = new Date(endDate)
    const endDateCopyDay = endDateCopy.getDay()
    const sunday = 0

    // Calculate the difference between the endDate's day and the sunday after this date.
    // Then change the endDate to that sunday.
    if (endDateCopyDay !== sunday) {
        const offset = [0, 6, 5, 4, 3, 2, 1]
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

    // if (!registrations.length) {
    //     throw new Error(`Unable to fetch registrations. Check your internet settings.`)
    // }

    return (
        <AppContext.Provider
            value={{ startDate, endDate, registrations, setModal, setSelectedDate }}
        >
            <h1>Gebedsrooster</h1>
            <Stats />
            {weeks}
            <ModalSignUp isOpen={modal} toggleModal={toggleModal} selectedDate={selectedDate} />
        </AppContext.Provider>
    )
}

export default App
