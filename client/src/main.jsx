import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import  {BrowserRouter} from 'react-router-dom'
import {Toaster} from "react-hot-toast"
import { Provider } from "react-redux";
import store from './store.js';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster/>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
