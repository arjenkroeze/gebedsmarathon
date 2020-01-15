import React from 'react'
import ReactDOM from 'react-dom'
import App from './js/App'
import { ProvideAuth } from './js/utilities/hooks'
import './scss/index.scss'

ReactDOM.render(
    <ProvideAuth>
        <App />
    </ProvideAuth>,
    document.getElementById('root')
)
