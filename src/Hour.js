import React from 'react'

const Hour = ({ date, hour }) => {
    return <li onClick={() => alert(`${date.toLocaleDateString()} om ${hour}.00 uur`)}>-</li>
}

export default Hour
