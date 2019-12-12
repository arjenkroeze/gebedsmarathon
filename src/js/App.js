import React, { useEffect, useState } from 'react'
import AppContext from './context/AppContext'
import Header from './Header'
import ModalDelete from './ModalDelete'
import ModalRegistrations from './ModalRegistrations'
import ModalSignUp from './ModalSignUp'
import { database } from './utilities/firebase'
import Week from './Week'

function App() {
    const startDate = new Date('2020-3-1 11:00')
    const endDate = new Date('2020-3-22 10:00')

    // State
    const [registrations, setRegistrations] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedRegistration, setSelectedRegistration] = useState(null)
    const [modal, setModal] = useState(null)

    // EFfect to fetch all registrations from the database
    useEffect(() => {
        const fetchData = async () => {
            // Listen to the snapshot from the Firestore
            database
                .collection('registrations')
                .orderBy('created', 'asc')
                .onSnapshot(querySnapshot => {
                    const results = []
                    querySnapshot.forEach(doc => {
                        results.push({ id: doc.id, ...doc.data() })
                    })
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

    return (
        <AppContext.Provider
            value={{
                startDate,
                endDate,
                registrations,
                setModal,
                selectedDate,
                setSelectedDate,
                selectedRegistration,
                setSelectedRegistration,
            }}
        >
            <Header />
            {weeks}
            <ModalSignUp isOpen={modal === 'signup'} toggleModal={toggleModal} />
            <ModalRegistrations isOpen={modal === 'registrations'} toggleModal={toggleModal} />
            <ModalDelete isOpen={modal === 'delete'} toggleModal={toggleModal} />
        </AppContext.Provider>
    )
}

export default App
