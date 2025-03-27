import React, { useState } from 'react'
import FAQ from '../components/FAQ.jsx'
import Contact from '../components/contact.jsx'

function FAQPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <FAQ setIsModalOpen={setIsModalOpen} />
      <Contact isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default FAQPage