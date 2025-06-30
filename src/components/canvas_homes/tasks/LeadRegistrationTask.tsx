import { useState } from 'react'
import Dropdown from './Dropdown'
import SendEmailModal from '../SendEmailModal'
import { useSelector } from 'react-redux'
import emaisentIcon from '/icons/canvas_homes/emailsenticon.svg'
import type { RootState } from '../../../store'

const LeadRegistrationTask = ({ propertyLink = '', emailSent = '', refreshData = () => {} }) => {
    const taskIds: string = useSelector((state: RootState) => state.taskId.taskId || '')
    const [isModalOpen, setModalOpen] = useState<boolean>(false)
    const emailOptions = [
        { label: 'Rajan', value: 'rajan@truestate.in' },
        { label: 'Deepak', value: 'deepakgoyal535aj@gmail.com' },
        { label: 'Amit', value: 'amit@truestate.in' },
        { label: 'SNN 1', value: 'satish@snnestatessales.com' },
        { label: 'SNN 2', value: 'channelsales@snnrajcorp.com' },
        { label: 'Adarsh 1', value: 'praveenkumar.p@adarshdevelopers.com' },
        { label: 'Adarsh 2', value: 'channelsales@adarshdevelopers.com' },
        { label: 'Birla', value: 'Sagnik.dasgupta@adityabirla.com' },
        { label: 'Total Environment', value: 'genuine.jayaprakash@totalenvironment.com' },
        { label: 'Assetz 1', value: 'channelpartners@assetzproperty.com' },
        { label: 'Assetz 2', value: 'aditi.vivek@assetzproperty.com' },
        { label: 'Goyal', value: 'Mkt.Bng@goyalco.com' },
        { label: 'Provident 1', value: 'Sukeerth.Muralidhar@providenthousing.com' },
        { label: 'Provident 2', value: 'channelsales@providenthousing.com' },
        { label: 'Arvind Smartspaces 1', value: 'ganapati.hegde@arvind.in' },
        { label: 'Arvind Smartspaces 2', value: 'cp.blr@arvind.in' },
        { label: 'Mahindra', value: 'DE.TANMAY@mahindra.com' },
        { label: 'GRC', value: 'sales@grcinfra.com' },
        { label: 'Aratt', value: 'channelsales@aratt.in' },
        { label: 'ABHEE', value: 'cp@abheeventures.com' },
        { label: 'Renaissance Holdings 1', value: 'sindhu@renaissanceholdings.com' },
        { label: 'Renaissance Holdings 2', value: 'nisarga@renaissanceholdings.com' },
        { label: 'Renaissance Holdings 3', value: 'raghu@renaissanceholdings.com' },
        { label: 'Trendsquars 1', value: 'cp@trendsquares.com' },
        { label: 'Trendsquars 2', value: 'amitkumar@trendsquares.com' },
        { label: 'Vajram', value: 'channelleads@vajramgroup.com' },
        { label: 'KNS', value: 'prithvi@knsgroup.in' },
        { label: 'Vaishnavi 1', value: 'binod@vaishnavigroup.com' },
        { label: 'Vaishnavi 2', value: 'presales@vaishnavigroup.com' },
        { label: 'Aspire proptech 1', value: 'Leads@aspireprop.com' },
        { label: 'Aspire proptech 2', value: 'Ankita@aspireprop.com' },
        { label: 'Aspire proptech 3', value: 'rishabh@aspireprop.com' },
        { label: 'Elegant', value: 'dheeppak@elegantbuildersanddevelopers.com' },
        { label: "Esteem King's Court 1", value: 'anil@esteemventures.in' },
        { label: "Esteem King's Court 2", value: 'vinay@esteemsouthpark.com' },
        { label: "Esteem King's Court 3", value: 'arun@esteemsouthpark.com' },
        { label: 'DNR Arista 1', value: 'ShivaKumar@dnrgroup.in' },
        { label: 'DNR Arista 2', value: 'tapti@dnrgroup.in' },
        { label: 'Sterling Developer', value: 'jason@sterlingdevelopers.com' },
        { label: 'Classic Featherlite 1', value: 'Kush@classicventures.in' },
        { label: 'Classic Featherlite 2', value: 'Eshwar@classicventures.in' },
        { label: 'Classic Featherlite 3', value: 'praveen@classicventures.in' },
        { label: 'Classic Featherlite 4', value: 'saravanan@classicventures.in' },
        { label: 'JRC 1', value: 'Akbar@jrcprojects.com' },
        { label: 'JRC 2', value: 'channelsales@jrcprojects.com' },
        { label: 'JRC 3', value: 'Pavan@jrcprojects.com' },
        { label: 'NR GROUP 1', value: 'joelfernandes@nrgreenwoods.com' },
        { label: 'NR GROUP 2', value: 'manjunath@nrgreenwoods.com' },
        { label: 'NR GROUP 3', value: 'sharanya.chilukuri@nrgreenwoods.com' },
        { label: 'Amrutha developers', value: 'amrutharamacons@gmail.com' },
        { label: 'Earth Aroma!', value: 'sales@eartharoma.co' },
        { label: 'HIREN WAHEN BUILDTECH', value: 'channelsales@hwbuildtech.com' },
        { label: 'Concorde 1', value: 'neethu.m@concorde.in' },
        { label: 'Concorde 2', value: 'channelsales@concorde.in' },
        { label: 'Sammy"s 1', value: 'channelpartners@sammys.in' },
        { label: 'Sammy"s 2', value: 'priyanshu@sammys.in' },
        { label: 'Sammy"s 3', value: 'jayesh@sammys.in' },
        { label: 'Sammy"s 4', value: 'Anoop@sammys.in' },
    ]

    const [_selectedEmail, setSelectedEmail] = useState<string>('')

    const handleEmailSelect = (email: string) => {
        setSelectedEmail(email)
    }

    // Check if email has been sent
    const isEmailSent = emailSent && emailSent.trim() !== ''

    return (
        <div className='flex justify-between items-start mb-2 gap-6'>
            {/* LEFT SIDE: Builder Email + Dropdown + Proceed */}
            <div className='flex flex-col gap-2 w-[40%]'>
                <div className='flex flex-row justify-between'>
                    <label className='text-sm font-medium text-gray-900'>Builder Email</label>

                    {/* Success message when email is sent */}
                    {isEmailSent && (
                        <span className='text-[13px] text-green-600 font-normal mb-1'>Email sent successfully</span>
                    )}
                </div>

                {isEmailSent ? (
                    /* Disabled state showing sent email */
                    <div className='relative w-full h-9 px-3 py-2 border border-gray-300 rounded-[5px] text-sm text-gray-700 bg-gray-50 flex items-center justify-between'>
                        <span>{emailSent}</span>
                        <div className='flex items-center justify-center w-5 h-5 rounded-full'>
                            <img src={emaisentIcon} />
                        </div>
                    </div>
                ) : (
                    /* Normal dropdown when email not sent */
                    <Dropdown
                        defaultValue='Select Builder Email'
                        onSelect={handleEmailSelect}
                        options={emailOptions}
                        placeholder='Select Builder Email'
                        className='w-full'
                        triggerClassName={`relative w-full h-9 px-3 py-2 border border-gray-300 rounded-sm text-sm text-gray-500 bg-white flex items-center justify-between focus:outline-none`}
                        menuClassName='absolute z-50 mt-0.5 w-full  max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg'
                        optionClassName='px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer aria-selected:font-medium'
                        state={true}
                    />
                )}

                {/* Proceed button - only show when email is not sent */}
                {!isEmailSent && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setModalOpen(true)
                        }}
                        className='w-fit px-4 h-8 bg-blue-500 text-white text-sm rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                        Proceed
                    </button>
                )}
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

            {isModalOpen && !isEmailSent && (
                <SendEmailModal
                    onClose={() => setModalOpen(false)}
                    email={_selectedEmail}
                    taskId={taskIds}
                    refreshData={refreshData}
                />
            )}
        </div>
    )
}

export default LeadRegistrationTask
