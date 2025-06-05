"use client"

import { useState } from "react"
import Layout from "../../layout/Layout"
import StateBaseTextField from "../../components/design-elements/StateBaseTextField"

type DropdownOption = {
  value: string
  label: string
}

const Dashboard = () => {
  const [dropdownValue, setDropdownValue] = useState<string>("US")

  const countryOptions: DropdownOption[] = [
    { value: "US", label: "US" },
    { value: "UK", label: "UK" },
    { value: "CA", label: "CA" },
    { value: "AU", label: "AU" },
  ]

  const phoneOptions: DropdownOption[] = [
    { value: "+1", label: "+1" },
    { value: "+44", label: "+44" },
    { value: "+91", label: "+91" },
    { value: "+86", label: "+86" },
  ]

  return (
    <Layout loading={false}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Enhanced Input Component Variants
          </h1>

          {/* Default State Variants */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Default State
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Basic Input
                </label>
                <StateBaseTextField placeholder="Placeholder" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  With Left Icon
                </label>
                <StateBaseTextField leftIcon={<span>👤</span>} placeholder="Placeholder" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  With Suffix
                </label>
                <StateBaseTextField
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  suffix="Ph"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dropdown with Prefix
                </label>
                <StateBaseTextField
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={countryOptions}
                  dropdownValue={dropdownValue}
                  onDropdownChange={setDropdownValue}
                  dropdownPrefix="Ph"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dropdown with Suffix
                </label>
                <StateBaseTextField
                  leftIcon={<span>🌐</span>}
                  placeholder="Select country"
                  hasDropdown
                  dropdownOptions={countryOptions}
                  dropdownValue={dropdownValue}
                  onDropdownChange={setDropdownValue}
                  dropdownSuffix="Co"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dropdown with Both Prefix & Suffix
                </label>
                <StateBaseTextField
                  leftIcon={<span>📞</span>}
                  placeholder="Phone number"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  onDropdownChange={() => {}}
                  dropdownPrefix="Ph"
                  dropdownSuffix="Co"
                />
              </div>
            </div>
          </section>

          {/* No Placeholder Variants */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              No Placeholder Examples
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No Placeholder
                </label>
                <StateBaseTextField leftIcon={<span>👤</span>} showPlaceholder={false} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No Placeholder with Dropdown
                </label>
                <StateBaseTextField
                  leftIcon={<span>📞</span>}
                  showPlaceholder={false}
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  onDropdownChange={() => {}}
                  dropdownPrefix="Ph"
                  dropdownSuffix="Co"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No Placeholder with Value
                </label>
                <StateBaseTextField
                  leftIcon={<span>✉️</span>}
                  showPlaceholder={false}
                  defaultValue="john@example.com"
                />
              </div>
            </div>
          </section>

          {/* Custom Styling Examples */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Custom Styling with className
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Shadow
                </label>
                <StateBaseTextField
                  placeholder="With shadow"
                  className="shadow-lg"
                  leftIcon={<span>🔍</span>}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Padding
                </label>
                <StateBaseTextField
                  placeholder="Extra padding"
                  className="py-4"
                  leftIcon={<span>👤</span>}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Background
                </label>
                <StateBaseTextField
                  placeholder="Custom background"
                  className="bg-blue-50 border-blue-200"
                  leftIcon={<span>✉️</span>}
                />
              </div>
            </div>
          </section>

          {/* Error State Variants */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Error State
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Basic Error
                </label>
                <StateBaseTextField placeholder="Placeholder" status="error" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Error with Both Prefix & Suffix
                </label>
                <StateBaseTextField
                  leftIcon={<span>📞</span>}
                  placeholder="Phone number"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  onDropdownChange={() => {}}
                  dropdownPrefix="Ph"
                  dropdownSuffix="Co"
                  status="error"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Error No Placeholder
                </label>
                <StateBaseTextField
                  leftIcon={<span>👤</span>}
                  showPlaceholder={false}
                  status="error"
                  defaultValue="Invalid input"
                />
              </div>
            </div>
          </section>

          {/* Success State Variants */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Success State
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success with Both Prefix & Suffix
                </label>
                <StateBaseTextField
                  leftIcon={<span>📞</span>}
                  placeholder="Phone number"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  onDropdownChange={() => {}}
                  dropdownPrefix="Ph"
                  dropdownSuffix="Co"
                  status="success"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Custom Style
                </label>
                <StateBaseTextField
                  leftIcon={<span>✉️</span>}
                  placeholder="Email address"
                  status="success"
                  className="shadow-md"
                  defaultValue="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success No Placeholder
                </label>
                <StateBaseTextField
                  leftIcon={<span>👤</span>}
                  showPlaceholder={false}
                  status="success"
                  defaultValue="Valid input"
                />
              </div>
            </div>
          </section>

          {/* Disabled State Variants */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Disabled State
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disabled with Both Prefix & Suffix
                </label>
                <StateBaseTextField
                  leftIcon={<span>📞</span>}
                  placeholder="Phone number"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  onDropdownChange={() => {}}
                  dropdownPrefix="Ph"
                  dropdownSuffix="Co"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disabled No Placeholder
                </label>
                <StateBaseTextField
                  leftIcon={<span>👤</span>}
                  showPlaceholder={false}
                  disabled
                  defaultValue="Disabled input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disabled Custom Style
                </label>
                <StateBaseTextField
                  leftIcon={<span>✉️</span>}
                  placeholder="Email address"
                  disabled
                  className="opacity-60"
                  defaultValue="john@example.com"
                />
              </div>
            </div>
          </section>

          {/* Full Width Examples */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Full Width Examples
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Width with Custom Styling
                </label>
                <StateBaseTextField
                  placeholder="Full width input with shadow"
                  fullWidth
                  className="shadow-lg py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Width with Both Prefix & Suffix
                </label>
                <StateBaseTextField
                  leftIcon={<span>📞</span>}
                  placeholder="Phone number"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  onDropdownChange={() => {}}
                  dropdownPrefix="Ph"
                  dropdownSuffix="Co"
                  fullWidth
                  className="shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Width No Placeholder
                </label>
                <StateBaseTextField
                  leftIcon={<span>🔍</span>}
                  showPlaceholder={false}
                  fullWidth
                  className="bg-gray-100 border-gray-300"
                />
              </div>
            </div>
          </section>

          {/* Labels and Hints - Default State */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Labels and Hints - Default State
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <StateBaseTextField
                  label="Label"
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Ph"
                  hintText="Your hint here"
                  hintTextColor="default"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Label"
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Ph"
                  hintText="Your hint here"
                  hintTextColor="default"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Label"
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Ph"
                  hintText="Your hint here"
                  hintTextColor="error"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Label"
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Ph"
                  hintText="Your hint here"
                  hintTextColor="default"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Label"
                  labelIcon={<div className="w-2 h-2 bg-red-500 rounded-full" />}
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Ph"
                  hintText="Your hint here"
                  hintTextColor="default"
                />
              </div>
            </div>
          </section>

          {/* Required Fields Examples */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Required Fields with Asterisk
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <StateBaseTextField
                  label="Label"
                  required
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Ph"
                  hintText="Your hint here"
                  hintTextColor="default"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Label"
                  required
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Ph"
                  hintText="Your hint here"
                  hintTextColor="default"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Label"
                  required
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Ph"
                  hintText="Your hint here"
                  hintTextColor="error"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Label"
                  required
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Ph"
                  hintText="Your hint here"
                  hintTextColor="default"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Label"
                  required
                  labelIcon={<div className="w-2 h-2 bg-red-500 rounded-full" />}
                  leftIcon={<span>👤</span>}
                  placeholder="Placeholder"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Ph"
                  hintText="Your hint here"
                  hintTextColor="default"
                />
              </div>
            </div>
          </section>

          {/* Error State Examples */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Error States
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <StateBaseTextField
                  label="Email Address"
                  required
                  leftIcon={<span>✉️</span>}
                  placeholder="Enter your email"
                  status="error"
                  hintText="Please enter a valid email address"
                  hintTextColor="error"
                  defaultValue="invalid-email"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Phone Number"
                  required
                  leftIcon={<span>📞</span>}
                  placeholder="Phone number"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Co"
                  status="error"
                  hintText="Phone number is required"
                  hintTextColor="error"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Username"
                  labelIcon={<span>⚠️</span>}
                  required
                  leftIcon={<span>👤</span>}
                  placeholder="Enter username"
                  status="error"
                  hintText="Username already exists"
                  hintTextColor="error"
                />
              </div>
            </div>
          </section>

          {/* Success State Examples */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Success States
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <StateBaseTextField
                  label="Email Address"
                  required
                  leftIcon={<span>✉️</span>}
                  placeholder="Enter your email"
                  status="success"
                  hintText="Email address is valid"
                  hintTextColor="success"
                  defaultValue="john@example.com"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Phone Number"
                  leftIcon={<span>📞</span>}
                  placeholder="Phone number"
                  hasDropdown
                  dropdownOptions={phoneOptions}
                  dropdownValue="+1"
                  dropdownPrefix="Ph"
                  dropdownSuffix="Co"
                  status="success"
                  hintText="Phone number verified"
                  hintTextColor="success"
                  defaultValue="1234567890"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Username"
                  labelIcon={<span>ℹ️</span>}
                  leftIcon={<span>👤</span>}
                  placeholder="Enter username"
                  status="success"
                  hintText="Username is available"
                  hintTextColor="success"
                  defaultValue="johndoe"
                />
              </div>
            </div>
          </section>

          {/* Different Hint Colors */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Different Hint Text Colors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <StateBaseTextField
                  label="Default Hint"
                  leftIcon={<span>🔍</span>}
                  placeholder="Search..."
                  hintText="This is a default hint"
                  hintTextColor="default"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Error Hint"
                  leftIcon={<span>🔍</span>}
                  placeholder="Search..."
                  hintText="This is an error hint"
                  hintTextColor="error"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Success Hint"
                  leftIcon={<span>🔍</span>}
                  placeholder="Search..."
                  hintText="This is a success hint"
                  hintTextColor="success"
                />
              </div>

              <div>
                <StateBaseTextField
                  label="Warning Hint"
                  leftIcon={<span>🔍</span>}
                  placeholder="Search..."
                  hintText="This is a warning hint"
                  hintTextColor="warning"
                />
              </div>
            </div>
          </section>

          {/* Full Width with Labels & Hints */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Full Width with Labels & Hints
            </h2>
            <div className="space-y-6">
              <StateBaseTextField
                label="Full Name"
                required
                leftIcon={<span>👤</span>}
                placeholder="Enter your full name"
                fullWidth
                hintText="Please enter your first and last name"
                hintTextColor="default"
              />

              <StateBaseTextField
                label="Country & Phone"
                labelIcon={<span>🌐</span>}
                required
                leftIcon={<span>📞</span>}
                placeholder="Phone number"
                hasDropdown
                dropdownOptions={phoneOptions}
                dropdownValue="+1"
                dropdownPrefix="Ph"
                dropdownSuffix="Co"
                fullWidth
                hintText="Select your country code and enter phone number"
                hintTextColor="default"
              />
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
