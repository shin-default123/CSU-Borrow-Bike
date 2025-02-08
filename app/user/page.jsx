import { UserButton, UserProfile } from '@clerk/nextjs'
import React from 'react'

function User() {
  return (
    <div className='my-6 md:px-20 lg:px-20'>
        <h2 className='font-bold text-2xl py-7'>Profile</h2>
        <UserProfile/>
    </div>
  )
}

export default User