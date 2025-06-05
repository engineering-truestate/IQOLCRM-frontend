
import Button from "./Button";

const BookmarkIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const ButtonTestExamples = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Button Component Examples</h1>
        
        {/* Left Icon + Text Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Left Icon + Text</h2>
          <div className="flex flex-wrap gap-4">
            <Button leftIcon={<BookmarkIcon />} bgColor="bg-gray-800" textColor="text-white">
              Button
            </Button>
            <Button leftIcon={<PlusIcon />} bgColor="bg-blue-600" textColor="text-white">
              Add Item
            </Button>
            <Button leftIcon={<BookmarkIcon />} bgColor="bg-green-500" textColor="text-white">
              Save
            </Button>
          </div>
        </section>

        {/* Right Icon + Text Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Right Icon + Text</h2>
          <div className="flex flex-wrap gap-4">
            <Button rightIcon={<BookmarkIcon />} bgColor="bg-white" textColor="text-gray-800" className="border border-gray-300">
              Button
            </Button>
            <Button rightIcon={<ArrowIcon />} bgColor="bg-purple-600" textColor="text-white">
              Continue
            </Button>
            <Button rightIcon={<ArrowIcon />} bgColor="bg-orange-500" textColor="text-white">
              Next Step
            </Button>
          </div>
        </section>

        {/* Text Only Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Text Only</h2>
          <div className="flex flex-wrap gap-4">
            <Button bgColor="bg-white" textColor="text-gray-800" className="border border-gray-300">
              Button
            </Button>
            <Button bgColor="bg-red-600" textColor="text-white">
              Delete
            </Button>
            <Button bgColor="bg-yellow-500" textColor="text-gray-900">
              Warning
            </Button>
          </div>
        </section>

        {/* Icon Only Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Icon Only</h2>
          <div className="flex flex-wrap gap-4">
            <Button leftIcon={<BookmarkIcon />} bgColor="bg-gray-800" textColor="text-white" />
            <Button leftIcon={<PlusIcon />} bgColor="bg-blue-600" textColor="text-white" />
            <Button leftIcon={<ArrowIcon />} bgColor="bg-green-500" textColor="text-white" />
          </div>
        </section>

        {/* Disabled States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Disabled States</h2>
          <div className="flex flex-wrap gap-4">
            <Button leftIcon={<BookmarkIcon />} bgColor="bg-gray-800" textColor="text-white" disabled>
              Disabled
            </Button>
            <Button rightIcon={<ArrowIcon />} bgColor="bg-blue-600" textColor="text-white" disabled>
              Disabled
            </Button>
            <Button bgColor="bg-green-500" textColor="text-white" disabled>
              Disabled
            </Button>
            <Button leftIcon={<PlusIcon />} bgColor="bg-red-600" textColor="text-white" disabled />
          </div>
        </section>

        {/* Custom Colors */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Custom Color Combinations</h2>
          <div className="flex flex-wrap gap-4">
            <Button leftIcon={<BookmarkIcon />} bgColor="bg-gradient-to-r from-pink-500 to-violet-500" textColor="text-white">
              Gradient
            </Button>
            <Button rightIcon={<ArrowIcon />} bgColor="bg-black" textColor="text-yellow-400">
              Custom
            </Button>
            <Button bgColor="bg-cyan-400" textColor="text-gray-900">
              Bright
            </Button>
            <Button leftIcon={<PlusIcon />} bgColor="bg-rose-100" textColor="text-rose-800" className="border border-rose-300" />
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Interactive Examples</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              leftIcon={<BookmarkIcon />} 
              bgColor="bg-indigo-600" 
              textColor="text-white"
              onClick={() => alert('Left icon button clicked!')}
            >
              Click Me
            </Button>
            <Button 
              rightIcon={<ArrowIcon />} 
              bgColor="bg-emerald-600" 
              textColor="text-white"
              onClick={() => alert('Right icon button clicked!')}
            >
              Submit
            </Button>
            <Button 
              bgColor="bg-amber-500" 
              textColor="text-white"
              onClick={() => alert('Text only button clicked!')}
            >
              Alert
            </Button>
            <Button 
              leftIcon={<PlusIcon />} 
              bgColor="bg-teal-600" 
              textColor="text-white"
              onClick={() => alert('Icon only button clicked!')}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonTestExamples;