'use client'

import { useState } from 'react'
import { SelectionButton, type SelectionType, type SelectionColor, type SelectionState } from './SelectionButtons'
import { SelectionGroup } from './SelectionButtonsGroup'

const colors: SelectionColor[] = ['blue', 'green', 'purple', 'red', 'gray']
const states: SelectionState[] = ['default', 'hover', 'focus', 'disabled']

const sampleOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    { label: 'Disabled Option', value: 'option4', disabled: true },
]

export default function TestPage() {
    const [radioValue, setRadioValue] = useState<string>('')
    const [checkboxValues, setCheckboxValues] = useState<string[]>([])

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-6xl mx-auto px-4 space-y-12'>
                <div className='text-center'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>Selection Components Test</h1>
                    <p className='text-gray-600'>Testing radio buttons and checkboxes in various states and colors</p>
                </div>

                {/* Individual Button States */}
                <div className='bg-white rounded-lg p-6 shadow-sm'>
                    <h2 className='text-xl font-semibold mb-6'>Individual Button States</h2>

                    {(['radio', 'checkbox'] as SelectionType[]).map((type) => (
                        <div key={type} className='mb-8'>
                            <h3 className='text-lg font-medium mb-4 capitalize'>{type} Buttons</h3>

                            {colors.map((color) => (
                                <div key={color} className='mb-6'>
                                    <h4 className='text-sm font-medium text-gray-700 mb-3 capitalize'>{color} Color</h4>
                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                        {states.map((state) => (
                                            <div key={state} className='space-y-2'>
                                                <p className='text-xs text-gray-500 capitalize'>{state} - Unchecked</p>
                                                <SelectionButton
                                                    type={type}
                                                    label={`${state} unchecked`}
                                                    value={`${type}-${color}-${state}-unchecked`}
                                                    color={color}
                                                    state={state}
                                                    disabled={state === 'disabled'}
                                                    checked={false}
                                                />
                                                <p className='text-xs text-gray-500 capitalize'>{state} - Checked</p>
                                                <SelectionButton
                                                    type={type}
                                                    label={`${state} checked`}
                                                    value={`${type}-${color}-${state}-checked`}
                                                    color={color}
                                                    state={state}
                                                    disabled={state === 'disabled'}
                                                    checked={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Selection Groups */}
                <div className='bg-white rounded-lg p-6 shadow-sm'>
                    <h2 className='text-xl font-semibold mb-6'>Selection Groups</h2>

                    <div className='grid md:grid-cols-2 gap-8'>
                        {/* Radio Groups */}
                        <div className='space-y-6'>
                            <h3 className='text-lg font-medium'>Radio Groups (Single Select)</h3>
                            {colors.map((color) => (
                                <SelectionGroup
                                    key={`radio-${color}`}
                                    title={`${color.charAt(0).toUpperCase() + color.slice(1)} Radio Group`}
                                    type='radio'
                                    color={color}
                                    options={sampleOptions}
                                    name={`radio-group-${color}`}
                                    onChange={(values) => console.log(`Radio ${color}:`, values)}
                                />
                            ))}
                        </div>

                        {/* Checkbox Groups */}
                        <div className='space-y-6'>
                            <h3 className='text-lg font-medium'>Checkbox Groups (Multi Select)</h3>
                            {colors.map((color) => (
                                <SelectionGroup
                                    key={`checkbox-${color}`}
                                    title={`${color.charAt(0).toUpperCase() + color.slice(1)} Checkbox Group`}
                                    type='checkbox'
                                    color={color}
                                    options={sampleOptions}
                                    multiSelect={true}
                                    onChange={(values) => console.log(`Checkbox ${color}:`, values)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Interactive Examples */}
                <div className='bg-white rounded-lg p-6 shadow-sm'>
                    <h2 className='text-xl font-semibold mb-6'>Interactive Examples</h2>

                    <div className='grid md:grid-cols-2 gap-8'>
                        <div>
                            <SelectionGroup
                                title='Choose Your Favorite Framework'
                                type='radio'
                                color='blue'
                                options={[
                                    { label: 'React', value: 'react' },
                                    { label: 'Vue', value: 'vue' },
                                    { label: 'Angular', value: 'angular' },
                                    { label: 'Svelte', value: 'svelte' },
                                ]}
                                name='framework'
                                onChange={(values) => setRadioValue(values[0] || '')}
                            />
                            {radioValue && <p className='mt-2 text-sm text-gray-600'>Selected: {radioValue}</p>}
                        </div>

                        <div>
                            <SelectionGroup
                                title='Select Your Skills'
                                type='checkbox'
                                color='green'
                                options={[
                                    { label: 'JavaScript', value: 'javascript' },
                                    { label: 'TypeScript', value: 'typescript' },
                                    { label: 'Python', value: 'python' },
                                    { label: 'Go', value: 'go' },
                                ]}
                                multiSelect={true}
                                onChange={setCheckboxValues}
                            />
                            {checkboxValues.length > 0 && (
                                <p className='mt-2 text-sm text-gray-600'>Selected: {checkboxValues.join(', ')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
