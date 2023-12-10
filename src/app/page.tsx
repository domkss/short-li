import LongURLInput from "@/components/LongURLInput";

export default function Home() {
  return (
    <main>
      <div className='flex flex-col items-center'>
        {/*Main URL input layout*/}
        <div className='mt-32 max-sm:mt-48 container max-w-2xl shadow-sm sm:rounded-md'>
          <div className='p-4 shadow-md bg-slate-400 bg-opacity-20 sm:rounded-md'>
            <h3 className='font-medium text-xl text-center'>Short any long URL for Free</h3>
            <LongURLInput />
          </div>
        </div>
        {/*Description section*/}
        <div className='flex flex-row max-sm:flex-col min-w-full mt-16 p-4 justify-around'>
          <div className='flex flex-col flex-wrap basis-1/4 justify-center p-3'>
            <h1 className='ms-4'>What is ShortLi</h1>
            <hr className='block border-b-2 border-t-neutral-100 max-w-full' />
            <p>
              ShortLi is an easy to use Free web link shortener tool.
              <br />
              Create short links, QR codes and custom Link-in-bio pages with trackable statistics.
            </p>
          </div>
          <div className='flex flex-col flex-wrap basis-1/4 justify-center p-3'>
            <h1 className='ms-4'>Default Link Expiry Time</h1>
            <hr className='block border-b-2 border-t-neutral-100 max-w-full' />
            <p>
              By default the links expire after 180 days.
              <br />
              However, with a simple registration, this feature can be customized or even turned off.
            </p>
          </div>
          <div className='flex flex-col flex-wrap basis-1/4 justify-center p-3'>
            <h1 className='ms-4'>Redirection statistics</h1>
            <hr className='block border-b-2 border-t-neutral-100 max-w-full' />
            <p>
              Track the performance of your shortened links in real-time, monitoring key metrics such as click-through
              rates, geographic locations of visitors, and device types used to access your links.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
