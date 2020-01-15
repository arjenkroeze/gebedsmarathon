export interface Registration {
    id: string
    created: firebase.firestore.Timestamp
    date: firebase.firestore.Timestamp
    name: string
    email: string
    needsReminder: boolean
    [key: string]: any
}

export interface AppContext {
    startDate: Date
    endDate: Date
    registrations: Registration[]
    setModal: React.Dispatch<React.SetStateAction<string | null>>
    selectedDate: Date
    setSelectedDate: React.Dispatch<React.SetStateAction<Date>>
    selectedRegistration: Registration | null
    setSelectedRegistration: React.Dispatch<React.SetStateAction<Registration | null>>
}

export interface HourProps {
    datetime: Date
    isActive: boolean
    isDisabled: boolean
    isHistory: boolean
    registrant: string
    registrationsCount: number
}

export interface ModalProps {
    isOpen: boolean
    toggleModal: () => void
}

export interface DateOption {
    label: string
    date: number
}

export interface HourOption {
    label: string
    hour: string
}

export interface WeekProps {
    startDate: Date
    endDate: Date
    weekNumber: number
}
