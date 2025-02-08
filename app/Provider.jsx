"use client"

import React from 'react'
import Header from './_components/Header'
import { LoadScript } from '@react-google-maps/api'
import { usePathname } from 'next/navigation'


function Provider({children}) {
  const path = usePathname()
  return (
    <div>
        <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY}
        libraries={['places']}
        >
        <Header/>
        <div className={`${path !== "/sign-in" && path !== "/sign-in/factor-one" && path !== "/sign-up" && path !== "/sign-up/verify-email-address" ? "mt-[90px]" : ""}`}>

        
          {children}
        </div>
        </LoadScript>
       </div>
  )
}

export default Provider