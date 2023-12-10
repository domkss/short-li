import LongURLInput from "@/components/LongURLInput";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <div className='flex flex-col items-center'>
        {/*Main URL input layout*/}
        <div className='sm:mt-14 container max-w-2xl shadow-sm sm:rounded-md'>
          <div className='p-4 max-sm:pt-36 max-sm:pb-24 shadow-md bg-slate-400 bg-opacity-20 sm:rounded-md'>
            <h3 className='font-medium text-xl text-center'>Short any long URL for Free</h3>
            <LongURLInput />
          </div>
        </div>
        {/*Description section*/}
        <div className='flex flex-row max-lg:flex-col min-w-full mt-14 mb-3 p-4 justify-evenly'>
          <div className='flex flex-col flex-wrap basis-1/4 p-6 border border-gray-200 rounded-lg shadow'>
            <div className='flex flex-row justify-center'>
              <Image className='h-14' src='share_link_undraw.svg' width={56} height={56} alt='Link share logo' />
              <span className='ml-3 flex flex-1 flex-col justify-center'>
                <h5 className='text-2xl font-bold tracking-tight text-gray-900'>What is ShortLi?</h5>
              </span>
            </div>
            <hr className='block border-b-1 border-t-neutral-200 max-w-full my-3' />
            <p className='mb-3 font-normal text-gray-700'>
              ShortLi is an easy to use Free web link shortener tool.
              <span className='block mb-2' />
              Create <span className='font-bold'>short links, QR codes and custom Link-in-bio pages</span> with
              trackable statistics.
            </p>
          </div>
          <div className='flex flex-col flex-wrap basis-1/4 my-3 p-6 border border-gray-200 rounded-lg shadow'>
            <div className='flex flex-row justify-center'>
              <Image className='h-14' src='expiry_time_undraw.svg' width={56} height={56} alt='Expiry time logo' />
              <span className='ml-3 flex flex-1 flex-col justify-center'>
                <h5 className='text-2xl font-bold tracking-tight text-gray-900'>Default Link Expiry Time</h5>
              </span>
            </div>
            <hr className='block border-b-1 border-t-neutral-200 max-w-full my-3' />
            <p className='mb-3 font-normal text-gray-700'>
              By default the links expire after <span className='font-bold'>180</span> days.
              <span className='block mb-2' />
              However, with a simple registration, this feature can be customized or even turned off.
            </p>
          </div>
          <div className='flex flex-col flex-wrap basis-1/4 my-3 p-6 border border-gray-200 rounded-lg shadow'>
            <div className='flex flex-row justify-center'>
              <Image className='h-14' src='charts_undraw.svg' width={56} height={56} alt='Expiry time logo' />
              <span className='ml-3 flex flex-1 flex-col justify-center'>
                <h5 className='text-2xl font-bold tracking-tight text-gray-900'>Redirection statistics</h5>
              </span>
            </div>

            <hr className='block border-b-1 border-t-neutral-200 max-w-full my-3' />
            <p className='mb-3 font-normal text-gray-700'>
              Track the performance of your shortened links in real-time.
              <span className='block mb-2' />
              Monitor key metrics such as click-through rates, geographic locations of visitors, and device types used
              to access your links.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
