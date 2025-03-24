import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import  {BrowserRouter} from 'react-router-dom'
import {Toaster} from "react-hot-toast"
import { Provider } from "react-redux";
import store,{persistor} from './store.js';
import { PersistGate } from "redux-persist/integration/react";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
          <Toaster/>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
