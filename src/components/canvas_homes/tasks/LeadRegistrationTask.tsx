import { useState } from 'react'
import Dropdown from './Dropdown'
import SendEmailModal from '../SendEmailModal'

const LeadRegistrationTask = ({ propertyLink = '' }) => {
    const [isModalOpen, setModalOpen] = useState<boolean>(false)
    const emailOptions = [
        { label: 'Rajan', value: 'rajan@truestate.in' },
        { label: 'Amit', value: 'amit@truestate.in' },
        { label: 'SNN', value: 'satish@snnestatessales.com, channelsales@snnrajcorp.com' },
        { label: 'Adarsh', value: 'praveenkumar.p@adarshdevelopers.com,channelsales@adarshdevelopers.com' },
        { label: 'Birla', value: 'Sagnik.dasgupta@adityabirla.com' },
        { label: 'Total Environment', value: 'genuine.jayaprakash@totalenvironment.com' },
        { label: 'Assetz', value: 'channelpartners@assetzproperty.com,aditi.vivek@assetzproperty.com' },
        { label: 'Goyal', value: 'Mkt.Bng@goyalco.com' },
        { label: 'Provident', value: 'Sukeerth.Muralidhar@providenthousing.com, channelsales@providenthousing.com' },
        { label: 'Arvind Smartspaces', value: 'ganapati.hegde@arvind.in, cp.blr@arvind.in' },
        { label: 'Mahindra', value: 'DE.TANMAY@mahindra.com' },
        { label: 'GRC', value: 'sales@grcinfra.com' },
        { label: 'Aratt', value: 'channelsales@aratt.in' },
        { label: 'ABHEE', value: 'cp@abheeventures.com' },
        {
            label: 'Renaissance Holdings',
            value: 'sindhu@renaissanceholdings.com , nisarga@renaissanceholdings.com, raghu@renaissanceholdings.com',
        },
        { label: 'Trendsquars', value: 'cp@trendsquares.com , amitkumar@trendsquares.com' },
        { label: 'Vajram', value: 'channelleads@vajramgroup.com' },
        { label: 'KNS', value: 'prithvi@knsgroup.in' },
        { label: 'Vaishnavi', value: 'binod@vaishnavigroup.com, presales@vaishnavigroup.com' },
        { label: 'Aspire proptech', value: 'Leads@aspireprop.com  , Ankita@aspireprop.com , rishabh@aspireprop.com' },
        { label: 'Elegant', value: 'dheeppak@elegantbuildersanddevelopers.com' },
        {
            label: "Esteem King's Court",
            value: 'anil@esteemventures.in ,vinay@esteemsouthpark.com , arun@esteemsouthpark.com',
        },
        { label: 'DNR Arista', value: 'ShivaKumar@dnrgroup.in , tapti@dnrgroup.in' },
        { label: 'Sterling Developer', value: 'jason@sterlingdevelopers.com' },
        {
            label: 'Classic Featherlite',
            value: 'Kush@classicventures.in , Eshwar@classicventures.in ,praveen@classicventures.in , saravanan@classicventures.in',
        },
        { label: 'JRC', value: 'Akbar@jrcprojects.com,channelsales@jrcprojects.com,Pavan@jrcprojects.com' },
        {
            label: 'NR GROUP',
            value: 'joelfernandes@nrgreenwoods.com , manjunath@nrgreenwoods.com , sharanya.chilukuri@nrgreenwoods.com',
        },
        { label: 'Amrutha developers', value: 'amrutharamacons@gmail.com' },
        { label: 'Earth Aroma!', value: 'sales@eartharoma.co' },
        { label: 'HIREN WAHEN BUILDTECH', value: 'channelsales@hwbuildtech.com' },
        { label: 'Concorde', value: 'neethu.m@concorde.in , channelsales@concorde.in' },
        {
            label: 'Sammy"s',
            value: 'channelpartners@sammys.in , priyanshu@sammys.in, jayesh@sammys.in,Anoop@sammys.in',
        },
    ]

    const [_selectedEmail, setSelectedEmail] = useState<string>('')

    const handleEmailSelect = (email: string) => {
        setSelectedEmail(email)
    }

    return (
        <div className='flex justify-between items-start mb-2 gap-6'>
            {/* LEFT SIDE: Builder Email + Dropdown + Proceed */}
            <div className='flex flex-col gap-2 w-[40%]'>
                <label className='text-sm font-medium text-gray-900'>Builder Email</label>

                <Dropdown
                    defaultValue='Select Builder Email'
                    onSelect={handleEmailSelect}
                    options={emailOptions}
                    placeholder='Select Builder Email'
                    className='w-full'
                    triggerClassName={`relative w-full h-9 px-3 py-2 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none`}
                    menuClassName='absolute z-50 mt-0.5 w-full  max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg'
                    optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                />

                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setModalOpen(true)
                    }}
                    className='w-fit px-4 h-8 bg-blue-500 text-white text-sm rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                    Proceed
                </button>
            </div>

            {/* RIGHT SIDE: Registration Portal + Link */}
            <div className='flex flex-col text-left pr-16 py-2'>
                <span className='text-sm font-medium text-gray-700 mb-1'>Registration Portal</span>
                <a
                    href={propertyLink}
                    onClick={(e) => e.stopPropagation()}
                    className='text-blue-500 text-sm hover:underline'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    Link website
                </a>
            </div>

            {isModalOpen && <SendEmailModal onClose={() => setModalOpen(false)} />}
        </div>
    )
}

export default LeadRegistrationTask
