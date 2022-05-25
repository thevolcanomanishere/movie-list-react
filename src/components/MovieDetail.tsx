import { Fragment, useEffect, useState } from 'react'
import { Dialog, Switch, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import { MovieItem } from '../types'

interface MovieDetailProps {
  movieItem: MovieItem;
  isOpenParent: boolean;
  setClosedParent: (open: boolean) => void;
}

export default function MovieDetail(props: MovieDetailProps) {
  const { isOpenParent, movieItem, setClosedParent } = props;
  const [movie] = useState<MovieItem>(movieItem);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [toggle, setToggle] = useState(false);

  const renderSynopsosis = () => {
    if(showFullSynopsis){
      return (
        <p className="text-sm text-gray-900" dangerouslySetInnerHTML={{__html: movie.synopsis}}/>
      )
    }
    return (
      <p className="pt-10 text-2xl text-gray-900">{movie.synopsisShort}</p>
    )
  }

  const renderToggle = () => {
    return (
      <div>
        <Switch
          checked={toggle}
          onChange={setToggle}
          className={`${toggle ? 'bg-teal-900' : 'bg-teal-700'}
            relative inline-flex h-[20px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
          <span className="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            className={`${toggle ? 'translate-x-5' : 'translate-x-0'}
              pointer-events-none inline-block h-[15px] w-[15px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
          />
        </Switch>
      </div>
    )
  }

  useEffect(() => {
    setShowFullSynopsis(toggle);
  }, [toggle])

  return (
    <Transition.Root show={isOpenParent} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setClosedParent}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="hidden fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity md:block" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-stretch md:items-center justify-center min-h-full text-center md:px-2 lg:px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
              enterTo="opacity-100 translate-y-0 md:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 md:scale-100"
              leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
            >
              <Dialog.Panel className="flex text-base text-left transform transition w-full md:max-w-2xl md:px-4 md:my-8 lg:max-w-4xl">
                <div className="w-full relative flex items-center bg-white px-4 pt-14 pb-8 overflow-hidden shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 sm:top-8 sm:right-6 md:top-6 md:right-6 lg:top-8 lg:right-8"
                    onClick={() => setClosedParent(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <div className="w-full grid grid-cols-1 gap-y-8 gap-x-6 items-start sm:grid-cols-12 lg:gap-x-8">
                    <div className="aspect-w-2 aspect-h-3 rounded-lg bg-gray-100 overflow-hidden sm:col-span-4 lg:col-span-5">
                      <img src={movie.image} alt={'Movie poster'} className="object-center object-cover" />
                    </div>
                    <div className="sm:col-span-8 lg:col-span-7">
                      <h2 className="text-2xl font-extrabold text-gray-900 sm:pr-12">{movie.name}</h2>
                      <p className="text-2xl text-black">Released: {movie.productionYear}</p>
                      
                      <div className='flex'>
                        <p className="text-xl text-gray-900">Synopsis:</p>
                        {renderToggle()}
                      </div>
                      {renderSynopsosis()}
                      <section aria-labelledby="options-heading" className="mt-10">
                        <h3 id="options-heading" className="sr-only">
                          Product options
                        </h3>

                      </section>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
